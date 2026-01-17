import { Router } from 'express';
import { bridgeState } from '../services/bridgeState.js';
import type {
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

// GET /api/agent/stream - SSE endpoint for real-time updates
agentRouter.get('/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Subscribe to bridge state events
  const unsubscribe = bridgeState.onEvent((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  console.log('SSE client connected');

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    unsubscribe();
    console.log('SSE client disconnected');
  });
});
