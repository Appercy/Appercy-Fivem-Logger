import type { FastifyInstance } from 'fastify';
import { getLogs, deleteLog, deleteLogs } from '../db/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export default async function logsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/logs', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      
      const filters = {
        type: query.type,
        level: query.level,
        resource: query.resource,
        search: query.search,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        limit: parseInt(query.limit || '100'),
        offset: parseInt(query.offset || '0'),
      };

      const logs = await getLogs(filters);
      
      // Parse JSON metadata for each log
      const parsedLogs = logs.map(log => ({
        ...log,
        metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata,
      }));

      return reply.send({ logs: parsedLogs });
    } catch (error) {
      console.error('Error fetching logs:', error);
      return reply.status(500).send({ error: 'Failed to fetch logs' });
    }
  });

  // Delete single log
  fastify.delete('/api/logs/:id', {
    preHandler: [requireAuth, requireAdmin],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const success = await deleteLog(parseInt(id));
      
      if (!success) {
        return reply.status(404).send({ error: 'Log not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Error deleting log:', error);
      return reply.status(500).send({ error: 'Failed to delete log' });
    }
  });

  // Delete multiple logs
  fastify.post('/api/logs/delete-bulk', {
    preHandler: [requireAuth, requireAdmin],
  }, async (request, reply) => {
    try {
      const { ids } = request.body as { ids: number[] };
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return reply.status(400).send({ error: 'Invalid or empty ids array' });
      }

      const deletedCount = await deleteLogs(ids);
      return reply.send({ success: true, deletedCount });
    } catch (error) {
      console.error('Error deleting logs:', error);
      return reply.status(500).send({ error: 'Failed to delete logs' });
    }
  });
}
