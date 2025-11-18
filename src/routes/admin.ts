import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getAllUsers,
  createUser,
  deleteUser,
  updateUserPassword,
  getUserById,
  getAllWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  toggleWebhookStatus,
} from '../db/index.js';

const SALT_ROUNDS = 10;

export default async function adminRoutes(fastify: FastifyInstance) {
  // Middleware to check admin access
  fastify.addHook('onRequest', requireAuth);
  fastify.addHook('onRequest', requireAdmin);

  // User Management Routes
  fastify.get('/api/admin/users', async (request, reply) => {
    try {
      const users = await getAllUsers();
      return reply.send({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return reply.status(500).send({ error: 'Failed to fetch users' });
    }
  });

  fastify.post('/api/admin/users', async (request, reply) => {
    try {
      const { username, password, isAdmin } = request.body as {
        username: string;
        password: string;
        isAdmin: boolean;
      };

      if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password required' });
      }

      if (password.length < 8) {
        return reply.status(400).send({ error: 'Password must be at least 8 characters' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await createUser(username, passwordHash, isAdmin || false);

      return reply.send({ success: true, message: 'User created successfully' });
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.status(400).send({ error: 'Username already exists' });
      }
      return reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  fastify.put('/api/admin/users/:id/password', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { password } = request.body as { password: string };

      if (!password || password.length < 8) {
        return reply.status(400).send({ error: 'Password must be at least 8 characters' });
      }

      const user = await getUserById(parseInt(id));
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await updateUserPassword(parseInt(id), passwordHash);

      return reply.send({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      return reply.status(500).send({ error: 'Failed to update password' });
    }
  });

  fastify.delete('/api/admin/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const user = await getUserById(parseInt(id));
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Prevent deleting yourself
      const currentUser = (request as any).user;
      if (user.username === currentUser) {
        return reply.status(400).send({ error: 'Cannot delete your own account' });
      }

      await deleteUser(parseInt(id));

      return reply.send({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return reply.status(500).send({ error: 'Failed to delete user' });
    }
  });

  // Webhook Management Routes
  fastify.get('/api/admin/webhooks', async (request, reply) => {
    try {
      const webhooks = await getAllWebhooks();
      return reply.send({ webhooks });
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      return reply.status(500).send({ error: 'Failed to fetch webhooks' });
    }
  });

  fastify.post('/api/admin/webhooks', async (request, reply) => {
    try {
      const { name, type, url, description, customPath } = request.body as {
        name: string;
        type: 'discord' | 'fivem';
        url: string;
        description: string;
        customPath?: string;
      };

      if (!name || !type || !url) {
        return reply.status(400).send({ error: 'Name, type, and URL are required' });
      }

      if (!['discord', 'fivem'].includes(type)) {
        return reply.status(400).send({ error: 'Invalid webhook type' });
      }

      await createWebhook(name, type, url, description || '', customPath);

      return reply.send({ success: true, message: 'Webhook created successfully' });
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.status(400).send({ error: 'Custom path already exists' });
      }
      return reply.status(500).send({ error: 'Failed to create webhook' });
    }
  });

  fastify.put('/api/admin/webhooks/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name, type, url, description, isActive, customPath } = request.body as {
        name: string;
        type: 'discord' | 'fivem';
        url: string;
        description: string;
        isActive: boolean;
        customPath?: string;
      };

      if (!name || !type || !url) {
        return reply.status(400).send({ error: 'Name, type, and URL are required' });
      }

      if (!['discord', 'fivem'].includes(type)) {
        return reply.status(400).send({ error: 'Invalid webhook type' });
      }

      await updateWebhook(
        parseInt(id),
        name,
        type,
        url,
        description || '',
        isActive !== false,
        customPath
      );

      return reply.send({ success: true, message: 'Webhook updated successfully' });
    } catch (error: any) {
      console.error('Error updating webhook:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.status(400).send({ error: 'Custom path already exists' });
      }
      return reply.status(500).send({ error: 'Failed to update webhook' });
    }
  });

  fastify.patch('/api/admin/webhooks/:id/toggle', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { isActive } = request.body as { isActive: boolean };

      await toggleWebhookStatus(parseInt(id), isActive);

      return reply.send({ success: true, message: 'Webhook status updated' });
    } catch (error) {
      console.error('Error toggling webhook:', error);
      return reply.status(500).send({ error: 'Failed to toggle webhook status' });
    }
  });

  fastify.delete('/api/admin/webhooks/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await deleteWebhook(parseInt(id));

      return reply.send({ success: true, message: 'Webhook deleted successfully' });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return reply.status(500).send({ error: 'Failed to delete webhook' });
    }
  });
}
