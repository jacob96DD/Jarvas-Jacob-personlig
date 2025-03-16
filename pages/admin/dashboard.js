import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiArrowLeft, FiLogOut, FiMessageSquare } from 'react-icons/fi';

// Admin dashboard component
export default function AdminDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Load conversations on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/conversations');
        
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        } else {
          setError('Failed to load conversations');
        }
      } catch (error) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Load conversation details
  const loadConversationDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/conversations?id=${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data);
      } else {
        setError('Failed to load conversation details');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle conversation click
  const handleConversationClick = (id) => {
    if (selectedConversation && selectedConversation.id === id) {
      setSelectedConversation(null);
    } else {
      loadConversationDetails(id);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Logout function
  const handleLogout = () => {
    document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-blue-600">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-600 hover:text-red-600"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </header>
      
      <main className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-100 border-b border-gray-200">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations found</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation && selectedConversation.id === conv.id
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => handleConversationClick(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-blue-100 rounded-full p-2">
                          <FiMessageSquare className="text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          Bot #{conv.botId || 'Unknown'} - Session {typeof conv.id === 'string' ? conv.id.substring(0, 8) : 'N/A'}...
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(conv.createdAt || 'Invalid date')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {conv.messages && conv.messages.length > 0 ? `${conv.messages.length} messages` : 'No messages'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-gray-100 border-b border-gray-200">
                  <h2 className="font-semibold">
                    Conversation Details - Bot #{selectedConversation.bot_id}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created: {formatDate(selectedConversation.created_at)}
                    {' | '}
                    Expires: {formatDate(selectedConversation.expires_at)}
                  </p>
                </div>
                
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages in this conversation
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedConversation.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.role === 'user' ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              msg.role === 'user'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {msg.role === 'user' ? 'User' : 'Bot'}
                              </span>
                              <span className="text-xs opacity-75">
                                {msg.created_at && formatDate(msg.created_at)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                <FiMessageSquare className="text-5xl mb-4" />
                <p className="text-lg">Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Server-side protection for admin routes
export async function getServerSideProps({ req, res }) {
  const { admin_token } = req.cookies;
  
  if (!admin_token) {
    console.log('No admin token found, redirecting to login');
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  
  try {
    // Verify token manually
    const decodedToken = JSON.parse(Buffer.from(admin_token, 'base64').toString());
    
    if (!decodedToken || decodedToken.role !== 'admin') {
      console.log('Invalid token data, redirecting to login');
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }
    
    // Check if token is expired
    if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
      console.log('Expired token, redirecting to login');
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }
    
    console.log('Valid admin token, proceeding to dashboard');
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}