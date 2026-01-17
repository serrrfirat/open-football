import type { Character } from './characters';
import type { GameDate } from './game-state';
import type { Promise, KnowledgeFact } from './memory';

// Message in a conversation
export interface Message {
  id: string;
  conversationId: string;
  role: 'manager' | 'character';
  content: string;
  timestamp: Date;

  // For character messages
  characterId?: string;
  emotion?: MessageEmotion;
}

export type MessageEmotion =
  | 'neutral'
  | 'happy'
  | 'angry'
  | 'frustrated'
  | 'hopeful'
  | 'defeated'
  | 'suspicious'
  | 'grateful';

// Conversation types
export type ConversationType =
  | 'player_unhappy'
  | 'player_dropped'
  | 'contract_negotiation'
  | 'transfer_request'
  | 'press_conference'
  | 'board_meeting'
  | 'agent_call'
  | 'welcome_signing'
  | 'pre_match_talk'
  | 'post_match_talk';

// Conversation status
export type ConversationStatus =
  | 'pending'      // In inbox, not started
  | 'active'       // Currently in progress
  | 'resolved'     // Completed with outcome
  | 'abandoned';   // User dismissed without resolution

// Full conversation
export interface Conversation {
  id: string;
  type: ConversationType;
  characterId: string;
  status: ConversationStatus;

  // Timing
  triggeredAt: GameDate;
  startedAt?: Date;
  endedAt?: Date;

  // Content
  messages: Message[];

  // Outcome
  outcome?: ConversationOutcome;
  summary?: string;
}

// Conversation outcome - what was decided
export interface ConversationOutcome {
  type: ConversationOutcomeType;
  details: Record<string, unknown>;

  // Effects on character
  moodChange?: number;        // -50 to +50
  trustChange?: number;       // -50 to +50

  // Promises made
  promisesMade?: Promise[];

  // Knowledge generated
  knowledgeGenerated?: KnowledgeFact[];
}

export type ConversationOutcomeType =
  | 'agreement_reached'
  | 'disagreement'
  | 'promise_made'
  | 'promise_broken_acknowledged'
  | 'transfer_request_submitted'
  | 'contract_accepted'
  | 'contract_rejected'
  | 'player_reassured'
  | 'player_angered'
  | 'no_resolution';

// Context provided to AI for conversation
export interface ConversationContext {
  conversation: Conversation;
  character: Character;

  // Relevant memory
  relevantPromises: Promise[];
  relevantKnowledge: KnowledgeFact[];
  recentInteractions: Conversation[];

  // Game context
  gameContext: {
    currentDate: GameDate;
    recentResults: string;      // e.g., "Won 3, Lost 2 in last 5"
    leaguePosition: number;
    nextMatch?: string;
  };

  // For players - their game state
  playerContext?: {
    recentMinutes: number;      // Minutes in last 5 matches
    lastStarted?: GameDate;
    seasonGoals: number;
    form: number;
  };
}
