import bcrypt from 'bcryptjs';
import { getDb } from './db';

// Authenticate user
export async function authenticateUser(username, password) {
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Check if user is admin
export async function isAdmin(userId) {
  const db = await getDb();
  const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
  
  return user && user.role === 'admin';
}

// Create JWT token for authenticated user
export function createAuthToken(user) {
  // In a real app, use a proper JWT library
  // For this example, we'll just encode a simple object
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify JWT token
export function verifyAuthToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}