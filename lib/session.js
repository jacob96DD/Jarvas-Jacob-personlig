import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

// Session cookie name
const SESSION_COOKIE = 'next_chat_session';
const COOKIE_EXPIRY = 7; // days

// Create or retrieve session ID
export function getOrCreateSessionId() {
  // Client-side only
  if (typeof window === 'undefined') {
    return null;
  }
  
  let sessionId = Cookies.get(SESSION_COOKIE);
  
  if (!sessionId) {
    sessionId = uuidv4();
    Cookies.set(SESSION_COOKIE, sessionId, { expires: COOKIE_EXPIRY });
  }
  
  return sessionId;
}

// Get session ID from request (for API routes)
export function getSessionFromRequest(req) {
  if (!req || !req.cookies) {
    return generateSessionId();
  }
  
  const cookies = req.cookies || {};
  let sessionId = cookies[SESSION_COOKIE];
  
  if (!sessionId) {
    sessionId = generateSessionId();
    // Note: We'll need to set this cookie in the response
  }
  
  return sessionId;
}

// Helper function to generate a session ID
function generateSessionId() {
  return uuidv4();
}

// Set session cookie in response (for API routes)
export function setSessionInResponse(res, sessionId) {
  if (!res || !res.setHeader) {
    return;
  }
  
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; Max-Age=${COOKIE_EXPIRY * 24 * 60 * 60}; SameSite=Lax`);
}