const RUST_BASE_URL = process.env.RUST_API_URL || 'http://localhost:18000';

class RustClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`Rust API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // ============================================
  // Existing Endpoints
  // ============================================

  async getDate() {
    return this.fetch('/api/date');
  }

  async getGameState() {
    // Aggregate data from multiple endpoints
    const [date, countries] = await Promise.all([
      this.fetch('/api/date'),
      this.fetch('/api/countries'),
    ]);

    return {
      date,
      countries,
    };
  }

  async getTeam(slug: string) {
    return this.fetch(`/api/teams/${slug}`);
  }

  async getPlayer(id: string) {
    return this.fetch(`/api/players/${id}`);
  }

  async getLeague(slug: string) {
    return this.fetch(`/api/leagues/${slug}`);
  }

  async getMatch(leagueSlug: string, matchId: string) {
    return this.fetch(`/api/match/${leagueSlug}/${matchId}`);
  }

  // ============================================
  // AI-Specific Endpoints (Stream C)
  // These will be implemented by the Rust agent
  // ============================================

  /**
   * Get player state with AI-relevant data
   * Endpoint: GET /api/players/{player_id}/state
   */
  async getPlayerState(playerId: string) {
    try {
      return await this.fetch(`/api/players/${playerId}/state`);
    } catch {
      // Return null when endpoint not yet available
      return null;
    }
  }

  /**
   * Get team state with AI-relevant data
   * Endpoint: GET /api/teams/{team_slug}/ai-state
   */
  async getTeamAIState(teamSlug: string) {
    try {
      return await this.fetch(`/api/teams/${teamSlug}/ai-state`);
    } catch {
      // Return null when endpoint not yet available
      return null;
    }
  }

  /**
   * Get squad with all player states
   * Endpoint: GET /api/teams/{team_slug}/squad-state
   */
  async getSquadState(teamSlug: string) {
    try {
      return await this.fetch(`/api/teams/${teamSlug}/squad-state`);
    } catch {
      // Return null when endpoint not yet available
      return null;
    }
  }

  /**
   * Get recent game events for AI triggers
   * Endpoint: GET /api/events/recent?since={timestamp}
   */
  async getRecentEvents(since?: string) {
    try {
      const query = since ? `?since=${encodeURIComponent(since)}` : '';
      return await this.fetch(`/api/events/recent${query}`);
    } catch {
      // Return empty array when endpoint not yet available
      return { events: [] };
    }
  }

  // ============================================
  // Health Check
  // ============================================

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetch('/api/date');
      return true;
    } catch {
      return false;
    }
  }
}

export const rustClient = new RustClient(RUST_BASE_URL);
