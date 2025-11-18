import type { FastifyInstance } from 'fastify';
import { createLog, getWebhookByPath } from '../db/index.js';
import { downloadMedia } from '../utils/media.js';

export default async function webhookRoutes(fastify: FastifyInstance) {
  // Discord webhook handler function
  const handleDiscordWebhook = async (request: any, reply: any, path?: string, level?: string) => {
    try {
      const payload = request.body as any;
      
      // Extract relevant information from Discord webhook
      const message = payload.content || JSON.stringify(payload);
      const logLevel = level || 'info'; // Use URL level or default to info
      const resource = path; // Use the path as the resource name
      
      // Extract media from attachments or embeds
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | 'file' | undefined;
      let mediaLocalPath: string | null = null;
      
      if (payload.attachments && payload.attachments.length > 0) {
        const attachment = payload.attachments[0];
        mediaUrl = attachment.url;
        if (attachment.content_type) {
          if (attachment.content_type.startsWith('image/')) mediaType = 'image';
          else if (attachment.content_type.startsWith('video/')) mediaType = 'video';
          else mediaType = 'file';
        }
      } else if (payload.embeds && payload.embeds.length > 0) {
        const embed = payload.embeds[0];
        if (embed.image) {
          mediaUrl = embed.image.url;
          mediaType = 'image';
        } else if (embed.video) {
          mediaUrl = embed.video.url;
          mediaType = 'video';
        } else if (embed.thumbnail) {
          mediaUrl = embed.thumbnail.url;
          mediaType = 'image';
        }
      }
      
      // Download media to local storage if URL exists
      if (mediaUrl && mediaType) {
        mediaLocalPath = await downloadMedia(mediaUrl, mediaType);
      }
      
      const metadata = {
        embeds: payload.embeds || [],
        username: payload.username,
        avatar_url: payload.avatar_url,
        attachments: payload.attachments || [],
        customPath: path || undefined,
        raw: payload,
      };

      await createLog('discord', logLevel, message, metadata, resource, mediaUrl, mediaType, mediaLocalPath || undefined);
      
      return reply.status(200).send({ success: true, message: 'Discord webhook received' });
    } catch (error) {
      console.error('Error processing Discord webhook:', error);
      return reply.status(500).send({ error: 'Failed to process webhook' });
    }
  };
  
  // Discord webhook endpoints - order matters: most specific first
  fastify.post('/api/webhook/discord/:path/:level', async (request, reply) => {
    const { path, level } = request.params as { path: string; level: string };
    return handleDiscordWebhook(request, reply, path, level);
  });
  
  fastify.post('/api/webhook/discord/:path', async (request, reply) => {
    const { path } = request.params as { path: string };
    return handleDiscordWebhook(request, reply, path);
  });
  
  fastify.post('/api/webhook/discord', async (request, reply) => {
    return handleDiscordWebhook(request, reply);
  });

  // FiveM/FiveManage log endpoint with automatic metadata filtering
  fastify.post('/api/webhook/fivem', async (request, reply) => {
    try {
      const payload = request.body as any;
      
      // Extract log information from FiveM payload
      // Auto-detect level from metadata or use default
      const level = payload.level || payload.severity || 'info';
      const message = payload.message || payload.msg || JSON.stringify(payload);
      
      // Auto-detect resource from metadata (script, resource, or metadata.resource)
      let resource = payload.resource || payload.script || undefined;
      if (!resource && payload.metadata && payload.metadata.resource) {
        resource = payload.metadata.resource;
      }
      
      const metadata = {
        resource: payload.resource,
        server: payload.server,
        player: payload.player,
        event: payload.event,
        identifier: payload.identifier,
        raw: payload,
      };

      await createLog('fivem', level, message, metadata, resource);
      
      return reply.status(200).send({ 
        success: true, 
        message: 'FiveM log received',
        filtered: { resource, level } 
      });
    } catch (error) {
      console.error('Error processing FiveM log:', error);
      return reply.status(500).send({ error: 'Failed to process log' });
    }
  });
  
  // Custom webhook path endpoint (e.g., /api/webhook/custom/esx)
  fastify.post('/api/webhook/custom/:path', async (request, reply) => {
    try {
      const { path } = request.params as { path: string };
      const payload = request.body as any;
      
      // Check if this custom path exists
      const webhook = await getWebhookByPath(path);
      
      // Extract log information
      const level = payload.level || payload.severity || 'info';
      const message = payload.message || payload.msg || JSON.stringify(payload);
      const resource = path; // Use the custom path as the resource name
      
      const metadata = {
        resource: payload.resource || path,
        server: payload.server,
        player: payload.player,
        event: payload.event,
        identifier: payload.identifier,
        customPath: path,
        raw: payload,
      };

      await createLog('fivem', level, message, metadata, resource);
      
      return reply.status(200).send({ success: true, message: `Log received for ${path}` });
    } catch (error) {
      console.error('Error processing custom webhook:', error);
      return reply.status(500).send({ error: 'Failed to process log' });
    }
  });
  
  // Custom webhook path with level (e.g., /api/webhook/custom/esx/info)
  fastify.post('/api/webhook/custom/:path/:level', async (request, reply) => {
    try {
      const { path, level } = request.params as { path: string; level: string };
      const payload = request.body as any;
      
      // Check if this custom path exists
      const webhook = await getWebhookByPath(path);
      
      // Extract log information, using the URL level
      const message = payload.message || payload.msg || JSON.stringify(payload);
      const resource = path; // Use the custom path as the resource name
      
      const metadata = {
        resource: payload.resource || path,
        server: payload.server,
        player: payload.player,
        event: payload.event,
        identifier: payload.identifier,
        customPath: path,
        raw: payload,
      };

      await createLog('fivem', level, message, metadata, resource);
      
      return reply.status(200).send({ success: true, message: `Log received for ${path} with level ${level}` });
    } catch (error) {
      console.error('Error processing custom webhook:', error);
      return reply.status(500).send({ error: 'Failed to process log' });
    }
  });
}
