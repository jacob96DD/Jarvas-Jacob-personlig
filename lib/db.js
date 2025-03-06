import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { addDays } from 'date-fns';

// Initialize the SQLite database
async function openDb() {
  return open({
    filename: './chat.db',
    driver: sqlite3.Database
  });
}

// Setup database tables
export async function initializeDatabase() {
  const db = await openDb();
  
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    );
    
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      bot_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER,
      role TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `);

  // Create admin user if it doesn't exist (default admin/admin123)
  const adminExists = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin']
    );
  }

  return db;
}

// Get database connection
export async function getDb() {
  return await openDb();
}

// Save conversation and message
export async function saveConversation(sessionId, botId, message) {
  const db = await getDb();
  const expiresAt = addDays(new Date(), 7).toISOString();
  
  // Get existing conversation or create new one
  let conversation = await db.get(
    'SELECT * FROM conversations WHERE session_id = ? AND bot_id = ?',
    [sessionId, botId]
  );
  
  if (!conversation) {
    const result = await db.run(
      'INSERT INTO conversations (session_id, bot_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, botId, expiresAt]
    );
    conversation = { id: result.lastID };
  } else {
    // Update the expiration date
    await db.run(
      'UPDATE conversations SET expires_at = ? WHERE id = ?',
      [expiresAt, conversation.id]
    );
  }
  
  // Save the user message
  await db.run(
    'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
    [conversation.id, 'user', message]
  );
  
  return conversation.id;
}

// Save bot response
export async function saveBotResponse(conversationId, response) {
  const db = await getDb();
  await db.run(
    'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
    [conversationId, 'assistant', response]
  );
}

// Get conversation history
export async function getConversationHistory(sessionId, botId) {
  const db = await getDb();
  const conversation = await db.get(
    'SELECT * FROM conversations WHERE session_id = ? AND bot_id = ?',
    [sessionId, botId]
  );
  
  if (!conversation) return [];
  
  const messages = await db.all(
    'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [conversation.id]
  );
  
  return messages;
}

// Get all conversations for admin dashboard
export async function getAllConversations() {
  const db = await getDb();
  
  // Clean up expired conversations
  await db.run('DELETE FROM conversations WHERE expires_at < datetime("now")');
  
  // Get active conversations with the most recent message
  const conversations = await db.all(`
    SELECT c.id, c.session_id, c.bot_id, c.created_at, c.expires_at, 
           m.content as last_message, m.created_at as last_activity
    FROM conversations c
    LEFT JOIN (
      SELECT conversation_id, content, created_at,
             ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) as rn
      FROM messages
    ) m ON c.id = m.conversation_id AND m.rn = 1
    ORDER BY m.created_at DESC
  `);
  
  return conversations;
}

// Get conversation details by ID
export async function getConversationById(id) {
  const db = await getDb();
  const conversation = await db.get('SELECT * FROM conversations WHERE id = ?', [id]);
  
  if (!conversation) return null;
  
  const messages = await db.all(
    'SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [id]
  );
  
  return { ...conversation, messages };
}

// Initialize the database on startup
initializeDatabase().catch(console.error);