import { Router } from 'express';
import { rustClient } from '../services/rustClient.js';

export const gameRouter = Router();

// GET /api/game/state - Get game state from Rust backend
gameRouter.get('/state', async (req, res) => {
  try {
    const state = await rustClient.getGameState();
    res.json({ state, lastUpdated: new Date() });
  } catch (error) {
    console.error('Failed to fetch game state:', error);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

// GET /api/game/team/:slug - Get team details
gameRouter.get('/team/:slug', async (req, res) => {
  try {
    const team = await rustClient.getTeam(req.params.slug);
    res.json(team);
  } catch (error) {
    console.error('Failed to fetch team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// GET /api/game/player/:id - Get player details
gameRouter.get('/player/:id', async (req, res) => {
  try {
    const player = await rustClient.getPlayer(req.params.id);
    res.json(player);
  } catch (error) {
    console.error('Failed to fetch player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// Proxy other game endpoints to Rust
gameRouter.get('/date', async (req, res) => {
  try {
    const date = await rustClient.getDate();
    res.json(date);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch date' });
  }
});
