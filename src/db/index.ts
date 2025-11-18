import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'fivem_logging',
};

let pool: mysql.Pool | null = null;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

export async function initializeDatabase() {
  try {
    // First connect without database to create it if needed
    const tempPool = mysql.createPool({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
    });

    const connection = await tempPool.getConnection();
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database}`);
    await connection.release();
    await tempPool.end();

    // Now connect to the database and run schema
    pool = mysql.createPool(DB_CONFIG);
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function hasAdminUser(): Promise<boolean> {
  try {
    const db = await getConnection();
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
    const count = (rows as any)[0].count;
    return count > 0;
  } catch (error) {
    console.error('Error checking for admin user:', error);
    return false;
  }
}

export async function createAdminUser(username: string, passwordHash: string) {
  const db = await getConnection();
  await db.query('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, TRUE)', [
    username,
    passwordHash,
  ]);
}

export async function getUserByUsername(username: string) {
  const db = await getConnection();
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return (rows as any[])[0] || null;
}

export async function createLog(
  type: 'discord' | 'fivem',
  level: string,
  message: string,
  metadata: any,
  resource?: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'file',
  mediaLocalPath?: string
) {
  const db = await getConnection();
  await db.query(
    'INSERT INTO logs (type, level, message, metadata, resource, media_url, media_type, media_local_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [type, level, message, JSON.stringify(metadata), resource || null, mediaUrl || null, mediaType || null, mediaLocalPath || null]
  );
}

export async function getLogs(filters: {
  type?: 'discord' | 'fivem';
  level?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  resource?: string;
  search?: string;
}) {
  const db = await getConnection();
  
  let query = 'SELECT * FROM logs WHERE 1=1';
  const params: any[] = [];

  if (filters.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.level) {
    query += ' AND level = ?';
    params.push(filters.level);
  }

  if (filters.resource) {
    query += ' AND resource = ?';
    params.push(filters.resource);
  }

  if (filters.search) {
    query += ' AND (message LIKE ? OR metadata LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (filters.startDate) {
    query += ' AND timestamp >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND timestamp <= ?';
    params.push(filters.endDate);
  }

  query += ' ORDER BY timestamp DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  const [rows] = await db.query(query, params);
  return rows as any[];
}

// User management functions
export async function getAllUsers() {
  const db = await getConnection();
  const [rows] = await db.query('SELECT id, username, is_admin, created_at FROM users ORDER BY created_at DESC');
  return rows as any[];
}

export async function createUser(username: string, passwordHash: string, isAdmin: boolean = false) {
  const db = await getConnection();
  await db.query('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)', [
    username,
    passwordHash,
    isAdmin,
  ]);
}

export async function deleteUser(userId: number) {
  const db = await getConnection();
  await db.query('DELETE FROM users WHERE id = ?', [userId]);
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getConnection();
  await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

export async function getUserById(userId: number) {
  const db = await getConnection();
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  return (rows as any[])[0] || null;
}

// Webhook management functions
export async function getAllWebhooks() {
  const db = await getConnection();
  const [rows] = await db.query('SELECT * FROM webhooks ORDER BY created_at DESC');
  return rows as any[];
}

export async function createWebhook(name: string, type: 'discord' | 'fivem', url: string, description: string, customPath?: string) {
  const db = await getConnection();
  await db.query('INSERT INTO webhooks (name, type, url, description, custom_path) VALUES (?, ?, ?, ?, ?)', [
    name,
    type,
    url,
    description,
    customPath || null,
  ]);
}

export async function updateWebhook(id: number, name: string, type: 'discord' | 'fivem', url: string, description: string, isActive: boolean, customPath?: string) {
  const db = await getConnection();
  await db.query(
    'UPDATE webhooks SET name = ?, type = ?, url = ?, description = ?, is_active = ?, custom_path = ? WHERE id = ?',
    [name, type, url, description, isActive, customPath || null, id]
  );
}

export async function getWebhookByPath(customPath: string) {
  const db = await getConnection();
  const [rows] = await db.query('SELECT * FROM webhooks WHERE custom_path = ? AND is_active = TRUE LIMIT 1', [customPath]);
  return (rows as any[])[0] || null;
}

export async function deleteWebhook(id: number) {
  const db = await getConnection();
  await db.query('DELETE FROM webhooks WHERE id = ?', [id]);
}

export async function toggleWebhookStatus(id: number, isActive: boolean) {
  const db = await getConnection();
  await db.query('UPDATE webhooks SET is_active = ? WHERE id = ?', [isActive, id]);
}

// Log deletion functions
export async function deleteLog(id: number): Promise<boolean> {
  const db = await getConnection();
  const [result] = await db.query('DELETE FROM logs WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

export async function deleteLogs(ids: number[]): Promise<number> {
  if (ids.length === 0) return 0;
  const db = await getConnection();
  const placeholders = ids.map(() => '?').join(',');
  const [result] = await db.query(`DELETE FROM logs WHERE id IN (${placeholders})`, ids);
  return (result as any).affectedRows;
}
