import { getAllConversations, getConversationById } from '../../../lib/db';
import { verifyAuthToken } from '../../../lib/auth';

export default async function handler(req, res) {
  console.log('Admin conversations API called');
  
  // Check if admin is authenticated
  const token = req.cookies.admin_token;
  console.log('Token from cookies:', token ? 'Present' : 'Missing');
  
  // Validate token manually first
  let isAuthorized = false;
  
  if (token) {
    try {
      // Try the library method first
      const user = verifyAuthToken(token);
      if (user && user.role === 'admin') {
        isAuthorized = true;
        console.log('User authorized via auth library');
      }
    } catch (authError) {
      console.error('Auth library error:', authError);
      
      // Fall back to manual token validation
      try {
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        if (decodedToken && decodedToken.role === 'admin') {
          if (!decodedToken.exp || decodedToken.exp > Math.floor(Date.now() / 1000)) {
            isAuthorized = true;
            console.log('User authorized via manual token validation');
          } else {
            console.log('Token expired');
          }
        } else {
          console.log('Invalid token data');
        }
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
      }
    }
  }
  
  if (!isAuthorized) {
    console.log('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      // If ID is provided, get specific conversation
      if (id) {
        console.log(`Fetching conversation with ID: ${id}`);
        const conversation = await getConversationById(parseInt(id));
        
        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
        
        return res.status(200).json(conversation);
      }
      
      // Otherwise, get all conversations
      console.log('Fetching all conversations');
      let conversations = [];
      
      try {
        conversations = await getAllConversations();
      } catch (dbError) {
        console.error('Database error fetching conversations:', dbError);
        // Return empty array instead of failing
        conversations = [];
      }
      
      console.log(`Returning ${conversations.length} conversations`);
      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: `Failed to fetch conversations: ${error.message}` });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}