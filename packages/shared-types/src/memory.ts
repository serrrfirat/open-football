import type { GameDate } from './game-state';

// Promise made by manager or character
export interface Promise {
  id: string;

  // Who made the promise
  madeBy: 'manager' | 'character';
  madeToCharacterId: string;

  // Content
  content: string;           // "You'll start the next 3 matches"
  category: PromiseCategory;

  // Timing
  madeAt: GameDate;
  expiresAt?: GameDate;

  // Status
  status: PromiseStatus;
  brokenAt?: GameDate;
  keptAt?: GameDate;

  // Verification
  verificationCriteria?: string;  // How to check if kept/broken

  // Witnesses
  witnessCharacterIds: string[];  // Who else knows about this

  // Conversation reference
  conversationId: string;
}

export type PromiseCategory =
  | 'playing_time'       // "You'll play more"
  | 'contract'           // "We'll discuss your contract"
  | 'transfer'           // "I won't sell you"
  | 'tactics'            // "We'll try your suggested formation"
  | 'signing'            // "We'll sign a new striker"
  | 'general';           // Other promises

export type PromiseStatus =
  | 'active'             // Promise is ongoing
  | 'kept'               // Promise was fulfilled
  | 'broken'             // Promise was not fulfilled
  | 'expired'            // Time passed without resolution
  | 'acknowledged';      // Broken and discussed

// Knowledge fact - something a character knows
export interface KnowledgeFact {
  id: string;

  // What is known
  content: string;           // "Marco is unhappy about playing time"
  category: KnowledgeCategory;

  // Who knows this
  characterId: string;

  // Source
  source: KnowledgeSource;
  sourceCharacterId?: string;  // Who told them (if gossip)

  // Timing
  learnedAt: GameDate;

  // Reliability
  confidence: number;        // 0-100, gossip has lower confidence

  // Related entities
  aboutCharacterId?: string; // If about another character
  aboutMatchId?: string;     // If about a match
}

export type KnowledgeCategory =
  | 'player_mood'        // "Player X is unhappy"
  | 'transfer_rumor'     // "Player X wants to leave"
  | 'manager_promise'    // "Manager promised X to player Y"
  | 'dressing_room'      // "Players are unhappy with training"
  | 'board_pressure'     // "Board is losing patience"
  | 'injury'             // "Player X is injured"
  | 'form'               // "Player X is in great form"
  | 'general';

export type KnowledgeSource =
  | 'direct'             // Witnessed or told directly by manager
  | 'gossip'             // Heard from another character
  | 'observation'        // Observed behavior
  | 'public';            // Public knowledge (match results, etc.)

// Character's complete knowledge state
export interface CharacterKnowledge {
  characterId: string;
  facts: KnowledgeFact[];

  // Quick access
  promisesKnown: Promise[];  // Promises they know about
}

// Information spread event
export interface KnowledgeSpreadEvent {
  id: string;

  // The knowledge being spread
  factId: string;

  // From who to who
  fromCharacterId: string;
  toCharacterId: string;

  // When and how
  spreadAt: GameDate;
  channel: SpreadChannel;
}

export type SpreadChannel =
  | 'direct_conversation'  // Characters talked
  | 'dressing_room'        // Shared in team setting
  | 'media'                // Public via press
  | 'agent_network'        // Through agents
  | 'time_passed';         // General knowledge over time
