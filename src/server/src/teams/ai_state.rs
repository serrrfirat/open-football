use crate::{ApiError, ApiResult, GameAppData};
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use axum::Json;
use core::{Person, Team};
use serde::{Deserialize, Serialize};

use super::get::{get_conditions, get_current_ability_stars};

#[derive(Deserialize)]
pub struct TeamAiStateRequest {
    pub team_slug: String,
}

/// AI-focused team state response for building game context
#[derive(Serialize)]
pub struct TeamAiStateResponse<'t> {
    pub id: u32,
    pub name: &'t str,
    pub slug: &'t str,

    // League context
    pub league_name: &'t str,
    pub league_slug: &'t str,

    // Recent form (calculated from match history)
    pub recent_form: String,

    // Financial health
    pub finances: FinancesDto,

    // Squad overview
    pub squad_summary: SquadSummaryDto,

    // Morale indicators
    pub morale: MoraleDto,

    // Tactical info
    pub tactics: Option<TacticsDto>,

    // Reputation
    pub reputation: ReputationDto,
}

#[derive(Serialize)]
pub struct FinancesDto {
    /// Weekly wage bill in thousands
    pub weekly_wage_k: u32,
}

#[derive(Serialize)]
pub struct SquadSummaryDto {
    /// Total players
    pub total_players: usize,
    /// Average age
    pub average_age: f32,
    /// Average ability (0-5 stars)
    pub average_ability: f32,
    /// Average condition (0-100)
    pub average_condition: f32,
    /// Players injured
    pub injured_count: usize,
    /// Players suspended
    pub suspended_count: usize,
    /// Players unhappy
    pub unhappy_count: usize,
}

#[derive(Serialize)]
pub struct MoraleDto {
    /// Overall team behaviour state
    pub team_behaviour: &'static str,
    /// Number of players with "Poor" behaviour
    pub players_poor_mood: usize,
    /// Number of players with "Good" behaviour
    pub players_good_mood: usize,
}

#[derive(Serialize)]
pub struct TacticsDto {
    /// Tactic name (e.g., "4-4-2", "4-3-3")
    pub formation: String,
    /// Tactical style
    pub style: String,
}

#[derive(Serialize)]
pub struct ReputationDto {
    /// World reputation 0-10000
    pub world: u16,
    /// Reputation level description
    pub level: String,
}

/// GET /api/teams/{team_slug}/ai-state
/// Returns AI-focused team state for building game context
pub async fn team_ai_state_action(
    State(state): State<GameAppData>,
    Path(route_params): Path<TeamAiStateRequest>,
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

    let league = simulator_data
        .league(team.league_id)
        .ok_or_else(|| ApiError::NotFound(format!("League with ID {} not found", team.league_id)))?;

    // Calculate squad summary
    let players = team.players();
    let total_players = players.len();

    let (total_age, total_ability, total_condition) = players.iter().fold((0u32, 0u32, 0u32), |acc, p| {
        (
            acc.0 + p.age(now.date()) as u32,
            acc.1 + get_current_ability_stars(p) as u32,
            acc.2 + get_conditions(p) as u32,
        )
    });

    let average_age = if total_players > 0 {
        total_age as f32 / total_players as f32
    } else {
        0.0
    };
    let average_ability = if total_players > 0 {
        total_ability as f32 / total_players as f32
    } else {
        0.0
    };
    let average_condition = if total_players > 0 {
        total_condition as f32 / total_players as f32
    } else {
        0.0
    };

    let injured_count = players.iter().filter(|p| p.player_attributes.is_injured).count();
    let suspended_count = players.iter().filter(|p| p.player_attributes.is_banned).count();
    let unhappy_count = players.iter().filter(|p| !p.happiness.is_happy()).count();

    // Calculate morale stats
    let players_poor_mood = players.iter().filter(|p| p.behaviour.as_str() == "Poor").count();
    let players_good_mood = players.iter().filter(|p| p.behaviour.as_str() == "Good").count();

    // Determine team's overall behaviour based on majority
    let team_behaviour = if players_good_mood > players_poor_mood {
        "Good"
    } else if players_poor_mood > players_good_mood {
        "Poor"
    } else {
        "Normal"
    };

    // Get tactics info
    let tactics = team.tactics.as_ref().map(|t| TacticsDto {
        formation: t.tactic_type.display_name().to_string(),
        style: format!("{:?}", t.tactic_type),
    });

    // Calculate reputation level
    let rep_level = match team.reputation.world {
        0..=1000 => "Local",
        1001..=3000 => "Regional",
        3001..=5000 => "National",
        5001..=7000 => "Continental",
        _ => "World Class",
    };

    // Recent form - we'll use a placeholder since match_history items are private
    // In a real implementation, we'd iterate match_history.items
    let recent_form = "-----".to_string(); // Placeholder for now

    let model = TeamAiStateResponse {
        id: team.id,
        name: &team.name,
        slug: &team.slug,
        league_name: &league.name,
        league_slug: &league.slug,
        recent_form,
        finances: FinancesDto {
            weekly_wage_k: team.get_week_salary() / 1000,
        },
        squad_summary: SquadSummaryDto {
            total_players,
            average_age,
            average_ability,
            average_condition,
            injured_count,
            suspended_count,
            unhappy_count,
        },
        morale: MoraleDto {
            team_behaviour,
            players_poor_mood,
            players_good_mood,
        },
        tactics,
        reputation: ReputationDto {
            world: team.reputation.world,
            level: rep_level.to_string(),
        },
    };

    Ok(Json(model).into_response())
}
