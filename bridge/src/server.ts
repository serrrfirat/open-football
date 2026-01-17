import express from 'express';
import cors from 'cors';
import { agentRouter } from './routes/agent.js';
import { conversationRouter } from './routes/conversation.js';
import { gameRouter } from './routes/game.js';
import { authMiddleware } from './middleware/auth.js';
import { bridgeState } from './services/bridgeState.js';
import { rustClient } from './services/rustClient.js';
import type { InboxResponse } from '@open-football/shared-types';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check with Rust backend status
  app.get('/health', async (req, res) => {
    const rustHealthy = await rustClient.healthCheck();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      rustBackend: rustHealthy ? 'connected' : 'disconnected',
      activeConversations: bridgeState.getNotifications().filter(n => !n.dismissed).length,
    });
  });

  // Routes
  app.use('/api/agent', authMiddleware, agentRouter);
  app.use('/api/conversation', conversationRouter);
  app.use('/api/game', gameRouter);

  // GET /api/inbox - Get pending notifications
  app.get('/api/inbox', (req, res) => {
    const notifications = bridgeState.getNotifications();
    const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

    const response: InboxResponse = {
      notifications: notifications.filter(n => !n.dismissed),
      unreadCount,
    };

    res.json(response);
  });

  // POST /api/inbox/:id/read - Mark notification as read
  app.post('/api/inbox/:id/read', (req, res) => {
    const { id } = req.params;
    const notifications = bridgeState.getNotifications();
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    res.json({ success: true });
  });

  // POST /api/inbox/:id/dismiss - Dismiss a notification
  app.post('/api/inbox/:id/dismiss', (req, res) => {
    const { id } = req.params;
    const notifications = bridgeState.getNotifications();
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.dismissed = true;
    res.json({ success: true });
  });

  // POST /api/notifications/seed - Seed test notifications (dev only)
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/notifications/seed', (req, res) => {
      const seedNotifications = [
        {
          eventId: 'event-1',
          title: 'Marco Rossi wants to talk',
          preview: 'Unhappy about playing time - dropped for last 3 matches',
          icon: 'player' as const,
          priority: 'urgent' as const,
          gameDate: { year: 2024, month: 9, day: 15, weekday: 'Sunday' },
          actionType: 'start_conversation' as const,
          conversationType: 'player_unhappy' as const,
          characterId: 'marco-rossi',
        },
        {
          eventId: 'event-2',
          title: 'Press Conference',
          preview: 'Pre-match press conference vs AC Milan',
          icon: 'press' as const,
          priority: 'high' as const,
          gameDate: { year: 2024, month: 9, day: 15, weekday: 'Sunday' },
          actionType: 'start_conversation' as const,
          conversationType: 'press_conference' as const,
          characterId: 'press',
        },
        {
          eventId: 'event-3',
          title: 'Paulo Dybala - Contract Discussion',
          preview: 'Contract expires in 6 months, wants to discuss future',
          icon: 'contract' as const,
          priority: 'medium' as const,
          gameDate: { year: 2024, month: 9, day: 14, weekday: 'Saturday' },
          actionType: 'start_conversation' as const,
          conversationType: 'contract_negotiation' as const,
          characterId: 'paulo-dybala',
        },
      ];

      const created = seedNotifications.map(n => bridgeState.addNotification(n));
      res.json({ success: true, count: created.length, notifications: created });
    });
  }

  return app;
}
