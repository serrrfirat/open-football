import express from 'express';
import cors from 'cors';
import { agentRouter } from './routes/agent.js';
import { conversationRouter } from './routes/conversation.js';
import { gameRouter } from './routes/game.js';
import { authMiddleware } from './middleware/auth.js';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/agent', authMiddleware, agentRouter);
  app.use('/api/conversation', conversationRouter);
  app.use('/api/game', gameRouter);

  // Inbox endpoint
  app.get('/api/inbox', (req, res) => {
    // TODO: Implement inbox
    res.json({ notifications: [], unreadCount: 0 });
  });

  return app;
}
