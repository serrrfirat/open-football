import { Router } from 'express';
import { bridgeState } from '../services/bridgeState.js';
import type {
  StartConversationRequest,
  SendMessageRequest,
} from '@open-football/shared-types';

export const conversationRouter = Router();

// POST /api/conversation/start - Start a new conversation
conversationRouter.post('/start', (req, res) => {
  const request = req.body as StartConversationRequest;
  const conversation = bridgeState.startConversation(request);
  res.json(conversation);
});

// GET /api/conversation/:id - Get conversation details
conversationRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const conversation = bridgeState.getConversation(id);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json(conversation);
});

// POST /api/conversation/:id/send - Send a message from the player
conversationRouter.post('/:id/send', (req, res) => {
  const { id } = req.params;
  const request = req.body as SendMessageRequest;

  const result = bridgeState.addPlayerMessage(id, request.content);

  if (!result) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json(result);
});

// POST /api/conversation/:id/end - End a conversation
conversationRouter.post('/:id/end', (req, res) => {
  const { id } = req.params;
  const result = bridgeState.endConversation(id);

  if (!result) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({ success: true });
});
