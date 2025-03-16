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
  
  // Kun tillad GET-anmodninger
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (id) {
      // Hent enkelt samtale hvis ID er angivet
      console.log(`Admin API: Henter samtale med ID: ${id}`);
      const conversation = await getConversationById(id);
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      return res.status(200).json(conversation);
    } else {
      // Hent alle samtaler
      console.log('Admin API: Henter alle samtaler');
      const conversations = await getAllConversations();
      console.log(`Admin API: Returnerer ${conversations.length} samtaler`);
      
      return res.status(200).json(conversations);
    }
  } catch (error) {
    console.error('Fejl i admin conversations API:', error);
    return res.status(500).json({ 
      error: 'Failed to load conversations',
      details: error.message 
    });
  }
}