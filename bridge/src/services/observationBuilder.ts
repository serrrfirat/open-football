import { rustClient } from './rustClient.js';
import { bridgeState } from './bridgeState.js';
import type {
  ObservationResponse,
  GameDate,
  TeamState,
  PlayerState,
  GameEvent,
  Character,
  Position,
} from '@open-football/shared-types';

/**
 * Builds an ObservationResponse by combining:
 * - Live game data from Rust backend
 * - Bridge state (conversations, notifications, memory)
 */
class ObservationBuilder {
  /**
   * Build a complete observation for the AI agent
   */
  async buildObservation(teamSlug: string = 'juventus'): Promise<ObservationResponse> {
    try {
      // Fetch data from Rust backend
      const [rustDate, rustTeam] = await Promise.all([
        this.fetchGameDate(),
        this.fetchTeamState(teamSlug),
      ]);

      // Get players from team (when available from Rust)
      const players = await this.fetchPlayerStates(teamSlug);

      // Get recent events (when available from Rust)
      const recentEvents = await this.fetchRecentEvents();

      // Build the observation combining Rust data + Bridge state
      const observation: ObservationResponse = {
        gameDate: rustDate,
        team: rustTeam,
        players,
        recentEvents,
        activeConversation: bridgeState.getObservation().activeConversation,
        pendingNotifications: bridgeState.getNotifications().filter(n => !n.dismissed),
        activePromises: bridgeState.getPromises().filter(p => p.status === 'active'),
        recentKnowledge: this.getRecentKnowledge(),
      };

      // Update bridge state with latest observation
      bridgeState.updateObservation(observation);

      return observation;
    } catch (error) {
      console.error('Failed to build observation from Rust:', error);
      // Fall back to bridge state's cached observation
      return bridgeState.getObservation();
    }
  }

  /**
   * Fetch game date from Rust backend
   */
  private async fetchGameDate(): Promise<GameDate> {
    try {
      const date = await rustClient.getDate() as any;
      return {
        year: date.year || new Date().getFullYear(),
        month: date.month || new Date().getMonth() + 1,
        day: date.day || new Date().getDate(),
        weekday: date.weekday || this.getWeekday(new Date()),
      };
    } catch {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        weekday: this.getWeekday(now),
      };
    }
  }

  /**
   * Fetch team state from Rust backend
   * Falls back to mock data if AI endpoints not yet available
   */
  private async fetchTeamState(slug: string): Promise<TeamState> {
    try {
      const team = await rustClient.getTeam(slug) as any;

      // Transform Rust team data to TeamState
      // Note: AI-specific fields (mood, boardConfidence) need Stream C endpoints
      return {
        id: team.id?.toString() || slug,
        name: team.name || slug,
        leaguePosition: team.league_position || 1,
        leagueName: team.league_name || 'Serie A',
        recentForm: team.recent_form || 'WWWWW',
        finances: {
          balance: team.balance || 50000000,
          wageBill: team.wage_bill || 2000000,
          transferBudget: team.transfer_budget || 20000000,
        },
        boardConfidence: team.board_confidence || 75,
        boardExpectations: team.board_expectations || 'Top 4 finish',
        teamMorale: team.team_morale || 70,
        upcomingMatches: team.upcoming_matches || [],
      };
    } catch {
      // Return mock data when Rust is unavailable
      return this.mockTeamState(slug);
    }
  }

  /**
   * Fetch player states from Rust backend
   * This will use the AI-specific endpoints when Stream C is complete
   */
  private async fetchPlayerStates(teamSlug: string): Promise<PlayerState[]> {
    try {
      // TODO: Use rustClient.getSquadState() when available
      // For now, return mock players
      return this.mockPlayerStates();
    } catch {
      return this.mockPlayerStates();
    }
  }

  /**
   * Fetch recent game events from Rust backend
   */
  private async fetchRecentEvents(): Promise<GameEvent[]> {
    try {
      // TODO: Use rustClient.getRecentEvents() when available
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Get recent knowledge from all characters
   */
  private getRecentKnowledge() {
    const allKnowledge: any[] = [];
    // BridgeState doesn't expose a way to get all knowledge, so return empty for now
    return allKnowledge.slice(-10);
  }

  private getWeekday(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private mockTeamState(slug: string): TeamState {
    return {
      id: slug,
      name: this.slugToName(slug),
      leaguePosition: 3,
      leagueName: 'Serie A',
      recentForm: 'WWLDW',
      finances: {
        balance: 50000000,
        wageBill: 2000000,
        transferBudget: 20000000,
      },
      boardConfidence: 72,
      boardExpectations: 'Top 4 finish',
      teamMorale: 68,
      upcomingMatches: [],
    };
  }

  private mockPlayerStates(): PlayerState[] {
    return [
      this.createMockPlayer('1', 'Marco Rossi', 26, 'ST', 35, 40, ['playing_time']),
      this.createMockPlayer('2', 'Paulo Dybala', 29, 'CAM', 55, 65, ['contract']),
      this.createMockPlayer('3', 'Federico Chiesa', 25, 'RW', 72, 78, []),
      this.createMockPlayer('4', 'Manuel Locatelli', 25, 'CM', 68, 70, []),
      this.createMockPlayer('5', 'Gleison Bremer', 26, 'CB', 75, 80, []),
    ];
  }

  private createMockPlayer(
    id: string,
    name: string,
    age: number,
    position: Position,
    mood: number,
    trustInManager: number,
    concerns: string[]
  ): PlayerState {
    return {
      id,
      name,
      age,
      nationality: 'Italy',
      position,
      preferredPositions: [position],
      overall: 78,
      potential: 85,
      mood,
      trustInManager,
      form: 70,
      fitness: 90,
      contract: {
        salary: 100000,
        expiresAt: { year: 2026, month: 6, day: 30, weekday: 'Tuesday' },
        yearsRemaining: 2,
      },
      recentMatches: [],
      concerns: concerns as any,
      seasonStats: {
        appearances: 15,
        goals: 5,
        assists: 3,
        averageRating: 7.2,
      },
    };
  }

  private slugToName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export const observationBuilder = new ObservationBuilder();
