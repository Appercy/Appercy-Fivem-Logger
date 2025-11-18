import type { FastifyRequest, FastifyReply } from 'fastify';
import { getUserByUsername } from '../db/index.js';

// Simple session storage (in production, use Redis or similar)
const sessions = new Map<string, { username: string; createdAt: number }>();

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createSession(username: string): string {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    username,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function getSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Check if session is expired
  if (Date.now() - session.createdAt > SESSION_DURATION) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = request.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  // Attach user to request
  (request as any).user = session.username;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const username = (request as any).user;
  
  if (!username) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const user = await getUserByUsername(username);
  
  if (!user || !user.is_admin) {
    return reply.status(403).send({ error: 'Forbidden: Admin access required' });
  }
}
