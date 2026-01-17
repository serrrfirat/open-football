import type { GameDate } from './game-state';
import type { ConversationType } from './conversations';

// Game event that can trigger conversations
export interface GameEvent {
  id: string;
  type: GameEventType;
  timestamp: Date;
  gameDate: GameDate;

  // Event data
  data: GameEventData;

  // Has this been handled?
  handled: boolean;
  triggeredConversationId?: string;
}

export type GameEventType =
  // Match events
  | 'match_result'
  | 'player_scored'
  | 'player_sent_off'
  | 'player_injured'
  | 'player_dropped'

  // Contract events
  | 'contract_expiring'
  | 'contract_expired'

  // Transfer events
  | 'transfer_offer_received'
  | 'player_transfer_listed'

  // Board events
  | 'board_confidence_low'
  | 'board_expectations_changed'

  // Morale events
  | 'player_morale_low'
  | 'team_morale_low'

  // Time events
  | 'pre_match'
  | 'post_match'
  | 'press_conference_scheduled'
  | 'weekly_review';

// Event-specific data
export type GameEventData =
  | MatchResultEventData
  | PlayerEventData
  | ContractEventData
  | TransferEventData
  | BoardEventData
  | MoraleEventData
  | ScheduledEventData;

export interface MatchResultEventData {
  matchId: string;
  opponent: string;
  score: { home: number; away: number };
  isHome: boolean;
  result: 'win' | 'draw' | 'loss';
}

export interface PlayerEventData {
  playerId: string;
  playerName: string;
  details?: string;
  matchId?: string;
}

export interface ContractEventData {
  playerId: string;
  playerName: string;
  monthsRemaining: number;
  currentSalary: number;
}

export interface TransferEventData {
  playerId: string;
  playerName: string;
  fromClub?: string;
  toClub?: string;
  offerAmount?: number;
}

export interface BoardEventData {
  confidence: number;
  previousConfidence?: number;
  message?: string;
}

export interface MoraleEventData {
  characterId: string;
  characterName: string;
  currentMorale: number;
  reason?: string;
}

export interface ScheduledEventData {
  eventType: 'pre_match' | 'post_match' | 'press_conference';
  matchId?: string;
  opponent?: string;
}

// Notification shown in inbox
export interface Notification {
  id: string;
  eventId: string;

  // Display
  title: string;
  preview: string;
  icon: NotificationIcon;
  priority: NotificationPriority;

  // Timing
  createdAt: Date;
  gameDate: GameDate;
  expiresAt?: GameDate;

  // Status
  read: boolean;
  dismissed: boolean;

  // Action
  actionType: 'start_conversation' | 'view_details' | 'dismiss';
  conversationType?: ConversationType;
  characterId?: string;
}

export type NotificationIcon =
  | 'player'
  | 'contract'
  | 'transfer'
  | 'board'
  | 'press'
  | 'match'
  | 'warning'
  | 'info';

export type NotificationPriority =
  | 'urgent'     // Red, requires immediate attention
  | 'high'       // Orange, should address soon
  | 'medium'     // Yellow, normal priority
  | 'low';       // Grey, can wait
