/**
 * FiveM Logging System - Main Application Entry Point
 * 
 * This is the main server file that initializes the Fastify web server,
 * sets up database connections, configures routes, and handles initial admin setup.
 * 
 * Features:
 * - Fastify web server with static file serving
 * - MySQL database initialization
 * - Session-based authentication
 * - Admin user creation (CLI or web-based)
 * - Webhook endpoints for Discord and FiveM
 * - RESTful API for log management
 * 
 * Environment Variables:
 * - PORT: Server port (default: 4000)
 * - DB_HOST: MySQL host (default: localhost)
 * - DB_PORT: MySQL port (default: 3306)
 * - DB_USER: MySQL username (default: root)
 * - DB_PASSWORD: MySQL password (default: password)
 * - DB_NAME: Database name (default: fivem_logging)
 * - SKIP_CLI_SETUP: Skip CLI admin setup prompt (default: false)
 */

import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import * as readline from 'readline';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { 
  initializeDatabase, 
  hasAdminUser, 
  createAdminUser 
} from './db/index.js';
import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';
import logsRoutes from './routes/logs.js';
import adminRoutes from './routes/admin.js';

// ESM module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const PORT = parseInt(process.env.PORT || '4000');
const SALT_ROUNDS = 10; // bcrypt salt rounds for password hashing

/**
 * Prompt for admin account creation via CLI
 * Used only when running outside Docker and no admin exists
 * 
 * @returns Promise with username and password
 */
async function promptAdminSetup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<{ username: string; password: string }>((resolve) => {
    console.log('\n========================================');
    console.log('First Run Setup - Create Admin Account');
    console.log('========================================\n');

    rl.question('Enter admin username: ', (username) => {
      rl.question('Enter admin password: ', (password) => {
        rl.close();
        resolve({ username, password });
      });
    });
  });
}

/**
 * Initialize server and database
 * Handles admin user creation if needed
 * Sets up Fastify server with all routes
 */
async function setupServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialization complete');

    // Check if admin user exists
    console.log('Checking for existing admin user...');
    const adminExists = await hasAdminUser();

    if (!adminExists) {
      console.log('No admin user found');
      
      // Skip CLI prompt in Docker or when SKIP_CLI_SETUP is set
      // This allows web-based setup via /setup.html
      const skipCliSetup = process.env.SKIP_CLI_SETUP === 'true';
      
      if (!skipCliSetup) {
        console.log('Starting CLI admin setup...');
        const { username, password } = await promptAdminSetup();
        
        // Validate input
        if (!username || !password) {
          console.error('Username and password are required');
          process.exit(1);
        }

        if (password.length < 8) {
          console.error('Password must be at least 8 characters');
          process.exit(1);
        }

        // Hash password and create admin user
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await createAdminUser(username, passwordHash);
        
        console.log('\n✓ Admin user created successfully!\n');
      } else {
        console.log('Skipping CLI setup (running in Docker mode)');
        console.log('Please visit http://localhost:4000/setup.html to create an admin account');
      }
    } else {
      console.log('Admin user already exists');
    }

    // Create Fastify instance
    console.log('Creating Fastify server...');
    const fastify = Fastify({
      logger: {
        level: 'info',
        transport: {
          target: 'pino-pretty',
        },
      },
    });

    // Register static files
    console.log('Registering static file serving...');
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
      prefix: '/',
    });

    // Setup endpoint for first-run admin creation via web UI
    console.log('Registering API endpoints...');
    fastify.post('/api/setup', async (request, reply) => {
      const adminExists = await hasAdminUser();
      
      if (adminExists) {
        return reply.status(400).send({ error: 'Admin user already exists' });
      }

      const { username, password } = request.body as { username: string; password: string };

      if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password required' });
      }

      if (password.length < 8) {
        return reply.status(400).send({ error: 'Password must be at least 8 characters' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await createAdminUser(username, passwordHash);
      
      console.log('Admin user created via web setup');

      return reply.send({ success: true });
    });

    // Register routes
    console.log('Registering route handlers...');
    fastify.register(authRoutes);
    fastify.register(webhookRoutes);
    fastify.register(logsRoutes);
    fastify.register(adminRoutes);

    // Root redirect
    fastify.get('/', async (request, reply) => {
      const adminExists = await hasAdminUser();
      
      if (!adminExists) {
        return reply.redirect('/setup.html');
      }
      
      return reply.redirect('/login.html');
    });

    // Start server
    console.log(`Starting server on port ${PORT}...`);
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    
    console.log('\n========================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`External access: http://<your-server-ip>:${PORT}`);
    console.log('========================================\n');
    console.log('Webhook endpoints:');
    console.log(`- Discord: POST http://<your-server-ip>:${PORT}/api/webhook/discord`);
    console.log(`- FiveM:   POST http://<your-server-ip>:${PORT}/api/webhook/fivem`);
    console.log(`\nAdmin dashboard: http://<your-server-ip>:${PORT}/\n`);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

setupServer();
