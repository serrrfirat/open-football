use crate::{ApiError, ApiResult, GameAppData};
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use axum::Json;
use core::Person;
use core::Player;
use core::PlayerStatusType;
use serde::{Deserialize, Serialize};

use super::get_conditions;

#[derive(Deserialize)]
pub struct PlayerStateRequest {
    pub player_id: u32,
}

/// AI-focused player state response with mood, form, contract and concerns
#[derive(Serialize)]
pub struct PlayerStateResponse<'p> {
    pub id: u32,
    pub name: String,
    pub position: &'p str,
    pub age: u8,

    // Mood & happiness
    pub mood: MoodDto,

    // Form & condition
    pub form: FormDto,

    // Contract status
    pub contract: Option<ContractStateDto>,

    // Current statuses/concerns
    pub concerns: Vec<&'static str>,

    // Attributes relevant for AI
    pub personality: PersonalityDto,
}

#[derive(Serialize)]
pub struct MoodDto {
    /// 0-100 scale derived from happiness
    pub happiness: u8,
    /// Is the player generally happy?
    pub is_happy: bool,
    /// Behaviour state: "Poor", "Normal", or "Good"
    pub behaviour: &'static str,
}

#[derive(Serialize)]
pub struct FormDto {
    /// Physical condition 0-100
    pub condition: u8,
    /// Average match rating
    pub average_rating: f32,
    /// Goals this season
    pub goals: u16,
    /// Assists this season
    pub assists: u16,
    /// Matches played
    pub matches_played: u16,
    /// Is match ready
    pub is_match_ready: bool,
}

#[derive(Serialize)]
pub struct ContractStateDto {
    /// Weekly salary in thousands
    pub salary_k: u32,
    /// Days until contract expires
    pub days_to_expiration: i64,
    /// Is contract expiring soon (< 6 months)
    pub is_expiring_soon: bool,
    /// Squad status
    pub squad_status: &'static str,
    /// Is transfer listed
    pub is_transfer_listed: bool,
}

#[derive(Serialize)]
pub struct PersonalityDto {
    /// Ambition 0-20
    pub ambition: u8,
    /// Loyalty 0-20
    pub loyalty: u8,
    /// Professionalism 0-20
    pub professionalism: u8,
    /// Temperament 0-20
    pub temperament: u8,
}

/// GET /api/players/{player_id}/state
/// Returns AI-focused player state with mood, form, contract and concerns
pub async fn player_state_action(
    State(state): State<GameAppData>,
    Path(route_params): Path<PlayerStateRequest>,
) -> ApiResult<Response> {
    let guard = state.data.read().await;

    let simulator_data = guard
        .as_ref()
        .ok_or_else(|| ApiError::InternalError("Simulator data not loaded".to_string()))?;

    let now = simulator_data.date;

    // Find player globally (since we only have player_id, not team_slug)
    let player: &Player = simulator_data
        .player(route_params.player_id)
        .ok_or_else(|| ApiError::NotFound(format!("Player with ID {} not found", route_params.player_id)))?;

    let concerns = get_player_concerns(player);

    let model = PlayerStateResponse {
        id: player.id,
        name: format!("{} {}", player.full_name.first_name, player.full_name.last_name),
        position: player.position().get_short_name(),
        age: player.age(now.date()),

        mood: MoodDto {
            happiness: calculate_happiness_score(player),
            is_happy: player.happiness.is_happy(),
            behaviour: player.behaviour.as_str(),
        },

        form: FormDto {
            condition: get_conditions(player),
            average_rating: player.statistics.average_rating,
            goals: player.statistics.goals,
            assists: player.statistics.assists,
            matches_played: player.statistics.played,
            is_match_ready: player.is_ready_for_match(),
        },

        contract: player.contract.as_ref().map(|c| {
            let days = c.days_to_expiration(now);
            ContractStateDto {
                salary_k: c.salary / 1000,
                days_to_expiration: days,
                is_expiring_soon: days < 180, // < 6 months
                squad_status: squad_status_to_str(&c.squad_status),
                is_transfer_listed: c.is_transfer_listed,
            }
        }),

        concerns,

        personality: PersonalityDto {
            ambition: (player.attributes.ambition * 20.0).floor() as u8,
            loyalty: (player.attributes.loyalty * 20.0).floor() as u8,
            professionalism: (player.attributes.professionalism * 20.0).floor() as u8,
            temperament: (player.attributes.temperament * 20.0).floor() as u8,
        },
    };

    Ok(Json(model).into_response())
}

/// Calculate a happiness score 0-100 based on player state
fn calculate_happiness_score(player: &Player) -> u8 {
    // Base score from behaviour state
    let base = match player.behaviour.as_str() {
        "Good" => 80,
        "Normal" => 50,
        "Poor" => 20,
        _ => 50,
    };

    // Adjust based on is_happy
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
