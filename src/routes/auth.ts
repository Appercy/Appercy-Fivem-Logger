import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { getUserByUsername } from '../db/index.js';
import { createSession } from '../middleware/auth.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password required' });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const sessionId = createSession(username);
    return reply.send({ sessionId, username });
  });
}
