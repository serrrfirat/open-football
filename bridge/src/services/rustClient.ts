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
    // TODO: Add player endpoint to Rust backend
    // For now, return mock data
    return {
      id,
      name: 'Player',
      position: 'MF',
    };
  }

  async getLeague(slug: string) {
    return this.fetch(`/api/leagues/${slug}`);
  }

  async getMatch(leagueSlug: string, matchId: string) {
    return this.fetch(`/api/match/${leagueSlug}/${matchId}`);
  }
}

export const rustClient = new RustClient(RUST_BASE_URL);
