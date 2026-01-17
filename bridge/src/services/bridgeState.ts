import { v4 as uuid } from 'uuid';
import type {
  ObservationResponse,
  ActRequest,
  AgentMessageRequest,
  Conversation,
  Message,
  StartConversationRequest,
  SendMessageResponse,
  Notification,
  Promise,
  KnowledgeFact,
  GameDate,
  StreamEvent,
} from '@open-football/shared-types';

interface AgentMessage extends AgentMessageRequest {
  id: string;
  at: Date;
}

// Event listener type
type EventListener = (event: StreamEvent) => void;

class BridgeState {
  // Event listeners for SSE broadcasting
  private eventListeners: Set<EventListener> = new Set();

  // Register an event listener (used by SSE endpoint)
  onEvent(listener: EventListener) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  // Broadcast event to all listeners
  private broadcast(event: StreamEvent) {
    this.eventListeners.forEach(listener => listener(event));
  }
  // Latest observation from game
  private observation: ObservationResponse | null = null;

  // Action queue from agent
  private actionQueue: ActRequest[] = [];

  // Agent messages for display
  private agentMessages: AgentMessage[] = [];
  private maxMessages = 100;

  // Active conversations
  private conversations: Map<string, Conversation> = new Map();

  // Notifications/inbox
  private notifications: Notification[] = [];

  // Memory stores
  private promises: Promise[] = [];
  private knowledge: Map<string, KnowledgeFact[]> = new Map();

  // ============================================
  // Observation
  // ============================================

  updateObservation(obs: Partial<ObservationResponse>) {
    this.observation = {
      ...this.observation,
      ...obs,
    } as ObservationResponse;
  }

  getObservation(): ObservationResponse {
    // Return current observation with active conversation context
    const activeConv = Array.from(this.conversations.values()).find(
      (c) => c.status === 'active'
    );

    return {
      gameDate: this.observation?.gameDate || this.mockGameDate(),
      team: this.observation?.team || this.mockTeam(),
      players: this.observation?.players || [],
      recentEvents: this.observation?.recentEvents || [],
      activeConversation: activeConv ? this.buildConversationContext(activeConv) : undefined,
      pendingNotifications: this.notifications.filter((n) => !n.dismissed),
      activePromises: this.promises.filter((p) => p.status === 'active'),
      recentKnowledge: this.getRecentKnowledge(),
    };
  }

  // ============================================
  // Actions
  // ============================================

  queueAction(action: ActRequest) {
    this.actionQueue.push(action);
  }

  dequeueAction(): ActRequest | undefined {
    return this.actionQueue.shift();
  }

  // ============================================
  // Agent Messages
  // ============================================

  addAgentMessage(msg: AgentMessageRequest) {
    const message: AgentMessage = {
      ...msg,
      id: uuid(),
      at: new Date(),
    };

    this.agentMessages.push(message);

    // Keep only last N messages
    if (this.agentMessages.length > this.maxMessages) {
      this.agentMessages = this.agentMessages.slice(-this.maxMessages);
    }
  }

  getAgentMessages(since?: string): AgentMessage[] {
    if (!since) {
      return this.agentMessages;
    }

    const sinceDate = new Date(since);
    return this.agentMessages.filter((m) => m.at > sinceDate);
  }

  // ============================================
  // Conversations
  // ============================================

  startConversation(request: StartConversationRequest): Conversation {
    const conversation: Conversation = {
      id: uuid(),
      type: request.conversationType as any,
      characterId: request.characterId,
      status: 'active',
      triggeredAt: this.observation?.gameDate || this.mockGameDate(),
      startedAt: new Date(),
      messages: [],
    };

    this.conversations.set(conversation.id, conversation);

    // Mark notification as read
    const notification = this.notifications.find((n) => n.id === request.notificationId);
    if (notification) {
      notification.read = true;
    }

    return conversation;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  addPlayerMessage(conversationId: string, content: string): SendMessageResponse | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const message: Message = {
      id: uuid(),
      conversationId,
      role: 'manager',
      content,
      timestamp: new Date(),
    };

    conversation.messages.push(message);

    return {
      message,
      conversationStatus: conversation.status,
    };
  }

  addCharacterMessage(conversationId: string, content: string, emotion?: string): Message | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const message: Message = {
      id: uuid(),
      conversationId,
      role: 'character',
      content,
      timestamp: new Date(),
      characterId: conversation.characterId,
      emotion: emotion as any,
    };

    conversation.messages.push(message);
    return message;
  }

  endConversation(id: string): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    conversation.status = 'resolved';
    conversation.endedAt = new Date();
    return true;
  }

  // ============================================
  // Notifications
  // ============================================

  addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'dismissed'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: uuid(),
      createdAt: new Date(),
      read: false,
      dismissed: false,
    };

    this.notifications.unshift(newNotification);

    // Broadcast notification event to SSE clients
    this.broadcast({ type: 'notification', notification: newNotification });

    return newNotification;
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  // ============================================
  // Memory
  // ============================================

  addPromise(promise: Omit<Promise, 'id'>): Promise {
    const newPromise: Promise = {
      ...promise,
      id: uuid(),
    };
    this.promises.push(newPromise);
    return newPromise;
  }

  getPromises(): Promise[] {
    return this.promises;
  }

  addKnowledge(characterId: string, fact: Omit<KnowledgeFact, 'id'>): KnowledgeFact {
    const newFact: KnowledgeFact = {
      ...fact,
      id: uuid(),
    };

    const existing = this.knowledge.get(characterId) || [];
    existing.push(newFact);
    this.knowledge.set(characterId, existing);

    return newFact;
  }

  getKnowledge(characterId: string): KnowledgeFact[] {
    return this.knowledge.get(characterId) || [];
  }

  // ============================================
  // Helpers
  // ============================================

  private buildConversationContext(conversation: Conversation) {
    return {
      conversation,
      character: this.mockCharacter(conversation.characterId),
      relevantPromises: this.promises.filter(
        (p) => p.madeToCharacterId === conversation.characterId
      ),
      relevantKnowledge: this.knowledge.get(conversation.characterId) || [],
      recentInteractions: [],
      gameContext: {
        currentDate: this.observation?.gameDate || this.mockGameDate(),
        recentResults: this.observation?.team?.recentForm || 'WWLDW',
        leaguePosition: this.observation?.team?.leaguePosition || 3,
        nextMatch: undefined,
      },
    };
  }

  private getRecentKnowledge(): KnowledgeFact[] {
    const allFacts: KnowledgeFact[] = [];
    this.knowledge.forEach((facts) => allFacts.push(...facts));
    return allFacts.slice(-10);
  }

  private mockGameDate(): GameDate {
    return { year: 2024, month: 9, day: 15, weekday: 'Sunday' };
  }

  private mockTeam() {
    return {
      id: 'juventus',
      name: 'Juventus',
      leaguePosition: 3,
      leagueName: 'Serie A',
      recentForm: 'WWLDW',
      finances: { balance: 50000000, wageBill: 2000000, transferBudget: 20000000 },
      boardConfidence: 72,
      boardExpectations: 'Top 4 finish',
      teamMorale: 68,
      upcomingMatches: [],
    };
  }

  private mockCharacter(id: string) {
    return {
      id,
      name: 'Marco Rossi',
      role: 'player' as const,
      personality: {
        ambition: 85,
        loyalty: 40,
        temperament: 30,
        professionalism: 60,
        confidence: 75,
        greed: 50,
      },
      mood: 35,
      trustInManager: 40,
    };
  }
}

// Singleton instance
export const bridgeState = new BridgeState();
