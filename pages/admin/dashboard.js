import { useState, useEffect, useCallback } from 'react';
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
    if (!dateString) return 'Ukendt dato';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('da-DK', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Fejl ved formatering af dato:', error);
      return 'Ugyldig dato';
    }
  };
  
  // Logout function
  const handleLogout = () => {
    document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };
  
  // I useEffect eller loadConversations-funktionen
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Indlæser samtaler...');
      const response = await fetch('/api/admin/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server svarede ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Indlæste ${data.length} samtaler`);
      
      setConversations(data);
    } catch (error) {
      console.error('Fejl ved indlæsning af samtaler:', error);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Konverteringsfunktion til at vise samtaler korrekt
  const formatConversation = (conv) => {
    return {
      id: conv.id || 'unknown',
      botId: conv.botId || 'Unknown',
      sessionId: conv.sessionId || 'Unknown',
      createdAt: conv.createdAt ? new Date(conv.createdAt) : null,
      updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : null,
      messageCount: conv.messages?.length || 0,
      blobUrl: conv.blobUrl || null,
      // tilføj andre felter efter behov
    };
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
                conversations.map((conv) => {
                  const formattedConv = formatConversation(conv);
                  return (
                    <div
                      key={formattedConv.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation && selectedConversation.id === formattedConv.id
                          ? 'bg-blue-50'
                          : ''
                      }`}
                      onClick={() => handleConversationClick(formattedConv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="bg-blue-100 rounded-full p-2">
                            <FiMessageSquare className="text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            Bot #{formattedConv.botId} - Session {formattedConv.sessionId?.substring(0, 8) || 'N/A'}...
                          </p>
                          <p className="text-sm text-gray-500">
                            {formattedConv.createdAt ? formattedConv.createdAt.toLocaleString() : 'Invalid date'}
                          </p>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {formattedConv.messageCount} message(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-gray-100 border-b border-gray-200">
                  <h2 className="font-semibold">
                    Samtaledetaljer - Bot #{selectedConversation.botId || 'Ukendt'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Oprettet: {formatDate(selectedConversation.createdAt)} | 
                    Udløber: {formatDate(selectedConversation.expiresAt)}
                  </p>
                </div>
                
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4">
                    {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                      selectedConversation.messages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div 
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              message.role === 'user' 
                                ? 'bg-gray-200 text-gray-800' 
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {message.role === 'user' ? 'Bruger' : 'Bot'}
                              </span>
                              <span className="text-xs opacity-75">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        Ingen beskeder i denne samtale
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <p>Vælg en samtale for at se detaljer</p>
                </div>
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