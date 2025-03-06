import { getConversationHistory } from '../../../lib/db';
import { getSessionFromRequest, setSessionInResponse } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { botId, sessionId: clientSessionId } = req.query;
    
    if (!botId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use session ID from the request or the one provided by the client
    const sessionId = getSessionFromRequest(req) || clientSessionId;
    setSessionInResponse(res, sessionId);
    
    // Get conversation history
    let messages = [];
    try {
      messages = await getConversationHistory(sessionId, parseInt(botId));
    } catch (dbError) {
      console.error('Database error when fetching history:', dbError);
      // Return empty array for testing
    }
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(200).json([]); // Return empty array instead of error
  }
}