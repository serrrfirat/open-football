use crate::player::{player_get_action, player_state_action};
use crate::GameAppData;
use axum::routing::get;
use axum::Router;

pub fn player_routes() -> Router<GameAppData> {
    Router::new()
        .route(
            "/api/teams/{team_slug}/players/{player_id}",
            get(player_get_action),
        )
        .route(
            "/api/players/{player_id}/state",
            get(player_state_action),
        )
}
