use crate::events::events_recent_action;
use crate::GameAppData;
use axum::routing::get;
use axum::Router;

pub fn event_routes() -> Router<GameAppData> {
    Router::new().route("/api/events/recent", get(events_recent_action))
}
