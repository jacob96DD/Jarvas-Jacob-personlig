import { getAllConversations, getConversationById } from '../../../lib/db';
import { verifyAuthToken } from '../../../lib/auth';

export default async function handler(req, res) {
  // Check if admin is authenticated
  const token = req.cookies.admin_token;
  const user = token ? verifyAuthToken(token) : null;
  
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      // If ID is provided, get specific conversation
      if (id) {
        const conversation = await getConversationById(parseInt(id));
        
        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
        
        return res.status(200).json(conversation);
      }
      
      // Otherwise, get all conversations
      const conversations = await getAllConversations();
      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}