import { Router } from 'express';
import { bridgeState } from '../services/bridgeState.js';
import type {
  ObservationResponse,
  ActRequest,
  AgentNextResponse,
  AgentMessageRequest,
} from '@open-football/shared-types';

export const agentRouter = Router();

// GET /api/agent/observe - Get current game state for AI
agentRouter.get('/observe', (req, res) => {
  const observation = bridgeState.getObservation();
  res.json(observation);
});

// POST /api/agent/act - Queue an action from the AI
agentRouter.post('/act', (req, res) => {
  const action = req.body as ActRequest;
  bridgeState.queueAction(action);
  res.json({ success: true, queued: true });
});

// GET /api/agent/next - Get next queued action to execute
agentRouter.get('/next', (req, res) => {
  const action = bridgeState.dequeueAction();
  const response: AgentNextResponse = {
    hasAction: !!action,
    action,
  };
  res.json(response);
});

// POST /api/agent/messages - Post a message (thinking, status, etc.)
agentRouter.post('/messages', (req, res) => {
  const message = req.body as AgentMessageRequest;
  bridgeState.addAgentMessage(message);
  res.json({ success: true });
});

// GET /api/agent/messages - Get agent messages (for frontend display)
agentRouter.get('/messages', (req, res) => {
  const since = req.query.since as string | undefined;
  const messages = bridgeState.getAgentMessages(since);
  res.json({ messages });
});
