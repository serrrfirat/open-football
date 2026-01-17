use crate::{ApiError, ApiResult, GameAppData};
use axum::extract::{Query, State};
use axum::response::{IntoResponse, Response};
use axum::Json;
use core::SimulatorData;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct RecentEventsQuery {
    /// Maximum number of events to return (default: 50)
    pub limit: Option<usize>,
    /// Filter by team_slug
    pub team_slug: Option<String>,
}

/// Response containing recent game events for AI context
#[derive(Serialize)]
pub struct RecentEventsResponse {
    /// Current game date
    pub game_date: String,
    /// Recent events
    pub events: Vec<GameEventDto>,
    /// Total matches in the system
    pub total_matches: usize,
}

/// A game event (match result, goal, etc.)
#[derive(Serialize)]
pub struct GameEventDto {
    /// Event type: "match_result", "goal", etc.
    pub event_type: String,
    /// Match ID
    pub match_id: String,
    /// League slug
    pub league_slug: String,
    /// Home team info
    pub home_team: TeamInfo,
    /// Away team info
    pub away_team: TeamInfo,
    /// Match score
    pub score: ScoreDto,
    /// Goals in this match
    pub goals: Vec<GoalEventDto>,
}

#[derive(Serialize)]
pub struct TeamInfo {
    pub id: u32,
    pub name: String,
    pub slug: String,
}

#[derive(Serialize)]
pub struct ScoreDto {
    pub home: u8,
    pub away: u8,
}

#[derive(Serialize)]
pub struct GoalEventDto {
    /// Player ID who scored
    pub player_id: u32,
    /// Player name (if found)
    pub player_name: Option<String>,
    /// Goal minute
    pub minute: u16,
    /// Is own goal
    pub is_own_goal: bool,
    /// Team that scored (home/away)
    pub scoring_team: String,
}

/// GET /api/events/recent
/// Returns recent game events (match results, goals) for AI context
pub async fn events_recent_action(
    State(state): State<GameAppData>,
    Query(params): Query<RecentEventsQuery>,
) -> ApiResult<Response> {
    let guard = state.data.read().await;

    let simulator_data = guard
        .as_ref()
        .ok_or_else(|| ApiError::InternalError("Simulator data not loaded".to_string()))?;

    let limit = params.limit.unwrap_or(50);

    let mut events = Vec::new();
    let mut total_matches = 0;

    // Get team_id if filtering by team_slug
    let filter_team_id = if let Some(ref team_slug) = params.team_slug {
        simulator_data
            .indexes
            .as_ref()
            .and_then(|i| i.slug_indexes.get_team_by_slug(team_slug))
    } else {
        None
    };

    // Iterate through all continents -> countries -> leagues -> matches
    for continent in &simulator_data.continents {
        for country in &continent.countries {
            for league in &country.leagues.leagues {
                for match_result in league.matches.iter() {
                    total_matches += 1;

                    // Apply team filter if specified
                    if let Some(team_id) = filter_team_id {
                        if match_result.home_team_id != team_id && match_result.away_team_id != team_id {
                            continue;
                        }
                    }

                    if events.len() >= limit {
                        break;
                    }

                    let event = build_match_event(match_result, simulator_data);
                    events.push(event);
                }
            }
        }
    }

    let response = RecentEventsResponse {
        game_date: simulator_data.date.format("%Y-%m-%d").to_string(),
        events,
        total_matches,
    };

    Ok(Json(response).into_response())
}

fn build_match_event(
    match_result: &core::r#match::MatchResult,
    simulator_data: &SimulatorData,
) -> GameEventDto {
    let home_team = simulator_data.team(match_result.home_team_id);
    let away_team = simulator_data.team(match_result.away_team_id);

    let home_info = home_team
        .map(|t| TeamInfo {
            id: t.id,
            name: t.name.clone(),
            slug: t.slug.clone(),
        })
        .unwrap_or_else(|| TeamInfo {
            id: match_result.home_team_id,
            name: "Unknown".to_string(),
            slug: "unknown".to_string(),
        });

    let away_info = away_team
        .map(|t| TeamInfo {
            id: t.id,
            name: t.name.clone(),
            slug: t.slug.clone(),
        })
        .unwrap_or_else(|| TeamInfo {
            id: match_result.away_team_id,
            name: "Unknown".to_string(),
            slug: "unknown".to_string(),
        });

    // Build goal events
    let goals: Vec<GoalEventDto> = match_result
        .score
        .details
        .iter()
        .map(|goal| {
            let player_name = simulator_data
                .player(goal.player_id)
                .map(|p| format!("{} {}", p.full_name.first_name, p.full_name.last_name));

            // Determine which team scored based on player's team
            let scoring_team = if let Some(player) = simulator_data.player(goal.player_id) {
                if let Some(home) = home_team {
                    if home.players.contains(player.id) {
                        if goal.is_auto_goal { "away" } else { "home" }
                    } else {
                        if goal.is_auto_goal { "home" } else { "away" }
                    }
                } else {
                    "unknown"
                }
            } else {
                "unknown"
            };

            GoalEventDto {
                player_id: goal.player_id,
                player_name,
                minute: goal.time as u16,
                is_own_goal: goal.is_auto_goal,
                scoring_team: scoring_team.to_string(),
            }
        })
        .collect();

    GameEventDto {
        event_type: "match_result".to_string(),
        match_id: match_result.id.clone(),
        league_slug: match_result.league_slug.clone(),
        home_team: home_info,
        away_team: away_info,
        score: ScoreDto {
            home: match_result.score.home_team.get(),
            away: match_result.score.away_team.get(),
        },
        goals,
    }
}
