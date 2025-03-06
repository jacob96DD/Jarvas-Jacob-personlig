import { authenticateUser, createAuthToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Authenticate user
    const user = await authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Create auth token
    const token = createAuthToken(user);
    
    // Set token in cookie
    res.setHeader(
      'Set-Cookie',
      `admin_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({ error: 'Failed to process login request' });
  }
}