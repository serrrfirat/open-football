import { Request, Response, NextFunction } from 'express';

const AGENT_TOKEN = process.env.AGENT_BRIDGE_TOKEN;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth in dev mode if no token configured
  if (!AGENT_TOKEN) {
    return next();
  }

  const token = req.headers['x-agent-token'];

  if (!token || token !== AGENT_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid agent token' });
  }

  next();
}
