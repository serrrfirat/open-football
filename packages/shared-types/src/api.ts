import type { GameDate, GameState, PlayerState, TeamState } from './game-state';
import type { Character } from './characters';
import type { Conversation, ConversationContext, Message, ConversationOutcome } from './conversations';
import type { Promise, KnowledgeFact } from './memory';
import type { GameEvent, Notification } from './events';

// ============================================
// Agent Endpoints (Claude Skill -> Bridge)
// ============================================

// GET /api/agent/observe
export interface ObservationResponse {
  // Current game state
  gameDate: GameDate;
  team: TeamState;
  players: PlayerState[];

  // Recent events
  recentEvents: GameEvent[];

  // If in conversation
  activeConversation?: ConversationContext;

  // Pending items
  pendingNotifications: Notification[];

  // Memory context
  activePromises: Promise[];
  recentKnowledge: KnowledgeFact[];
}

// POST /api/agent/act
export interface ActRequest {
  type: ActType;
  payload: ActPayload;
}

export type ActType =
  | 'respond'           // Respond in conversation
  | 'trigger_event'     // Create new event/notification
  | 'update_memory'     // Add promise or knowledge
  | 'end_conversation'; // Close current conversation

export type ActPayload =
  | RespondPayload
  | TriggerEventPayload
  | UpdateMemoryPayload
  | EndConversationPayload;

export interface RespondPayload {
  conversationId: string;
  characterId: string;
  content: string;
  emotion?: string;
}

export interface TriggerEventPayload {
  eventType: string;
  characterId: string;
  title: string;
  preview: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  conversationType: string;
}

export interface UpdateMemoryPayload {
  type: 'promise' | 'knowledge';
  data: Partial<Promise> | Partial<KnowledgeFact>;
}

export interface EndConversationPayload {
  conversationId: string;
  outcome: ConversationOutcome;
  summary: string;
}

// GET /api/agent/next
export interface AgentNextResponse {
  hasAction: boolean;
  action?: ActRequest;
}

// POST /api/agent/messages
export interface AgentMessageRequest {
  type: 'thinking' | 'action' | 'status' | 'response';
  content: string;
}

// ============================================
// Frontend Endpoints (React -> Bridge)
// ============================================

// GET /api/inbox
export interface InboxResponse {
  notifications: Notification[];
  unreadCount: number;
}

// GET /api/conversation/:id
export interface ConversationResponse {
  conversation: Conversation;
  character: Character;
}

// POST /api/conversation/:id/send
export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  message: Message;
  conversationStatus: string;
}

// GET /api/game/state
export interface GameStateResponse {
  state: GameState;
  lastUpdated: Date;
}

// POST /api/conversation/start
export interface StartConversationRequest {
  notificationId: string;
  characterId: string;
  conversationType: string;
}

export interface StartConversationResponse {
  conversation: Conversation;
  character: Character;
}

// ============================================
// Streaming (SSE)
// ============================================

// GET /api/agent/stream
export type StreamEvent =
  | { type: 'start'; conversationId: string }
  | { type: 'chunk'; content: string }
  | { type: 'end'; conversationId: string }
  | { type: 'notification'; notification: Notification };

// ============================================
// Bridge Internal State
// ============================================

export interface BridgeState {
  // Latest observation cached
  latestObservation: ObservationResponse | null;

  // Action queue from agent
  actionQueue: ActRequest[];

  // Message history for agent display
  agentMessages: AgentMessageRequest[];

  // Active conversations
  activeConversations: Map<string, Conversation>;

  // Memory stores
  promises: Promise[];
  knowledge: Map<string, KnowledgeFact[]>;

  // Connected clients for streaming
  streamClients: Set<string>;
}
