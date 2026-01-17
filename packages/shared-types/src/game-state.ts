import type { PlayerSkills, DetailedContract, DetailedPosition, PositionProficiency, PreferredFoot } from './skills';

// Game date representation
export interface GameDate {
  year: number;
  month: number;
  day: number;
  weekday: string;
}

// Simplified player position for UI display
// For detailed position matching Rust simulation, use DetailedPosition from './skills'
export type Position =
  | 'GK'
  | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM'
  | 'LW' | 'RW' | 'CF' | 'ST';

// Contract details
export interface Contract {
  salary: number;           // Weekly salary
  expiresAt: GameDate;
  yearsRemaining: number;
  releaseClause?: number;
}

// Recent match performance
export interface MatchPerformance {
  matchId: string;
  date: GameDate;
  opponent: string;
  started: boolean;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;           // 0-10 rating
}

// Player state for AI context
export interface PlayerState {
  id: string;
  name: string;
  age: number;
  nationality: string;
  position: Position;
  preferredPositions: Position[];

  // Attributes (0-100)
  overall: number;
  potential: number;

  // Dynamic state
  mood: number;              // 0-100, current happiness
  trustInManager: number;    // 0-100, relationship with manager
  form: number;              // 0-100, recent performance trend
  fitness: number;           // 0-100, physical condition

  // Contract
  contract: Contract;

  // Recent history
  recentMatches: MatchPerformance[];
  concerns: PlayerConcern[];

  // Season stats
  seasonStats: {
    appearances: number;
    goals: number;
    assists: number;
    averageRating: number;
  };

  // Optional detailed data (from Rust simulation)
  // These are provided when more detail is needed
  detailedSkills?: PlayerSkills;
  detailedContract?: DetailedContract;
  detailedPositions?: PositionProficiency[];
  preferredFoot?: PreferredFoot;
}

export type PlayerConcern =
  | 'playing_time'
  | 'contract'
  | 'team_performance'
  | 'personal_form'
  | 'wants_transfer'
  | 'homesick';

// Team state
export interface TeamState {
  id: string;
  name: string;
  leaguePosition: number;
  leagueName: string;

  // Recent form (e.g., "WWLDW")
  recentForm: string;

  // Finances
  finances: {
    balance: number;
    wageBill: number;
    transferBudget: number;
  };

  // Board
  boardConfidence: number;   // 0-100
  boardExpectations: string; // e.g., "Top 4 finish"

  // Squad morale
  teamMorale: number;        // 0-100, average of player moods

  // Upcoming
  upcomingMatches: UpcomingMatch[];
}

export interface UpcomingMatch {
  matchId: string;
  date: GameDate;
  opponent: string;
  competition: string;
  isHome: boolean;
}

// Full game state snapshot
export interface GameState {
  currentDate: GameDate;
  team: TeamState;
  players: PlayerState[];
}
