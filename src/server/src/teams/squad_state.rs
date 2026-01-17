use crate::{ApiError, ApiResult, GameAppData};
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use axum::Json;
use core::{Person, Player, PlayerStatusType, Team};
use serde::{Deserialize, Serialize};

use super::get::{get_conditions, get_current_ability_stars};

#[derive(Deserialize)]
pub struct SquadStateRequest {
    pub team_slug: String,
}

/// Full squad state response with all players and their AI-relevant states
#[derive(Serialize)]
pub struct SquadStateResponse<'t> {
    pub team_id: u32,
    pub team_name: &'t str,
    pub team_slug: &'t str,

    /// Total morale score (0-100)
    pub team_morale: u8,

    /// All players with their states
    pub players: Vec<PlayerSquadState>,
}

#[derive(Serialize)]
pub struct PlayerSquadState {
    pub id: u32,
    pub name: String,
    pub position: String,
    pub age: u8,

    // State indicators
    /// Happiness score 0-100
    pub happiness: u8,
    /// Is player currently happy
    pub is_happy: bool,
    /// Behaviour: "Poor", "Normal", "Good"
    pub behaviour: &'static str,

    // Form
    /// Physical condition 0-100
    pub condition: u8,
    /// Ability stars 0-5
    pub ability: u8,
    /// Average rating
    pub average_rating: f32,
    /// Is match ready
    pub is_match_ready: bool,

    // Status flags
    pub is_injured: bool,
    pub is_suspended: bool,
    pub is_transfer_listed: bool,

    // Contract
    /// Days until contract expires
    pub contract_days_remaining: Option<i64>,
    /// Is contract expiring soon
    pub contract_expiring_soon: bool,
    /// Squad status
    pub squad_status: Option<&'static str>,

    // Concerns (human readable)
    pub concerns: Vec<&'static str>,

    // Personality traits (0-20 scale)
    pub ambition: u8,
    pub loyalty: u8,
    pub temperament: u8,
}

/// GET /api/teams/{team_slug}/squad-state
/// Returns all players with their AI-focused states
pub async fn squad_state_action(
    State(state): State<GameAppData>,
    Path(route_params): Path<SquadStateRequest>,
) -> ApiResult<Response> {
    let guard = state.data.read().await;

    let simulator_data = guard
        .as_ref()
        .ok_or_else(|| ApiError::InternalError("Simulator data not loaded".to_string()))?;

    let indexes = simulator_data
        .indexes
        .as_ref()
        .ok_or_else(|| ApiError::InternalError("Indexes not available".to_string()))?;

    let now = simulator_data.date;

    let team_id = indexes
        .slug_indexes
        .get_team_by_slug(&route_params.team_slug)
        .ok_or_else(|| ApiError::NotFound(format!("Team '{}' not found", route_params.team_slug)))?;

    let team: &Team = simulator_data
        .team(team_id)
        .ok_or_else(|| ApiError::NotFound(format!("Team with ID {} not found", team_id)))?;

    let players: Vec<PlayerSquadState> = team
        .players()
        .iter()
        .map(|p| build_player_squad_state(p, now))
        .collect();

    // Calculate team morale as average happiness
    let total_happiness: u32 = players.iter().map(|p| p.happiness as u32).sum();
    let team_morale = if !players.is_empty() {
        (total_happiness / players.len() as u32) as u8
    } else {
        50
    };

    let model = SquadStateResponse {
        team_id: team.id,
        team_name: &team.name,
        team_slug: &team.slug,
        team_morale,
        players,
    };

    Ok(Json(model).into_response())
}

fn build_player_squad_state(player: &Player, now: chrono::NaiveDateTime) -> PlayerSquadState {
    let happiness = calculate_happiness_score(player);
    let concerns = get_player_concerns(player);

    let (contract_days, expiring_soon, squad_status) = player.contract.as_ref().map_or(
        (None, false, None),
        |c| {
            let days = c.days_to_expiration(now);
            (
                Some(days),
                days < 180,
                Some(squad_status_to_str(&c.squad_status)),
            )
        },
    );

    PlayerSquadState {
        id: player.id,
        name: format!("{} {}", player.full_name.first_name, player.full_name.last_name),
        position: player.positions.display_positions().join(", "),
        age: player.age(now.date()),

        happiness,
        is_happy: player.happiness.is_happy(),
        behaviour: player.behaviour.as_str(),

        condition: get_conditions(player),
        ability: get_current_ability_stars(player),
        average_rating: player.statistics.average_rating,
        is_match_ready: player.is_ready_for_match(),

        is_injured: player.player_attributes.is_injured,
        is_suspended: player.player_attributes.is_banned,
        is_transfer_listed: player.contract.as_ref().map_or(false, |c| c.is_transfer_listed),

        contract_days_remaining: contract_days,
        contract_expiring_soon: expiring_soon,
        squad_status,

        concerns,

        ambition: (player.attributes.ambition * 20.0).floor() as u8,
        loyalty: (player.attributes.loyalty * 20.0).floor() as u8,
        temperament: (player.attributes.temperament * 20.0).floor() as u8,
    }
}

/// Calculate a happiness score 0-100 based on player state
fn calculate_happiness_score(player: &Player) -> u8 {
    let base = match player.behaviour.as_str() {
        "Good" => 80,
        "Normal" => 50,
        "Poor" => 20,
        _ => 50,
    };

    if player.happiness.is_happy() {
        std::cmp::min(100, base + 20)
    } else {
        std::cmp::max(0, base - 20)
    }
}

/// Convert player statuses to human-readable concern strings
fn get_player_concerns(player: &Player) -> Vec<&'static str> {
    player.statuses.get().iter().filter_map(|status| {
        match status {
            PlayerStatusType::Inj => Some("injured"),
            PlayerStatusType::Sus => Some("suspended"),
            PlayerStatusType::Wnt => Some("wanted_by_other_club"),
            PlayerStatusType::Unh => Some("unhappy"),
            PlayerStatusType::Req => Some("transfer_request"),
            PlayerStatusType::Lst => Some("transfer_listed"),
            PlayerStatusType::Lmp => Some("low_match_fitness"),
            PlayerStatusType::Rst => Some("needs_rest"),
            PlayerStatusType::Ctr => Some("contract_expiring"),
            PlayerStatusType::Fut => Some("concerned_about_future"),
            PlayerStatusType::Slt => Some("slight_concerns"),
            PlayerStatusType::Int => Some("international_duty"),
            PlayerStatusType::Unf => Some("unfit"),
            _ => None,
        }
    }).collect()
}

/// Convert squad status enum to string
fn squad_status_to_str(status: &core::PlayerSquadStatus) -> &'static str {
    use core::PlayerSquadStatus::*;
    match status {
        Invalid => "invalid",
        NotYetSet => "not_set",
        KeyPlayer => "key_player",
        FirstTeamRegular => "first_team_regular",
        FirstTeamSquadRotation => "rotation",
        MainBackupPlayer => "backup",
        HotProspectForTheFuture => "hot_prospect",
        DecentYoungster => "decent_youngster",
        NotNeeded => "not_needed",
        SquadStatusCount => "unknown",
    }
}
