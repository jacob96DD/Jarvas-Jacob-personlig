import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUser, FiCpu, FiAlertCircle } from 'react-icons/fi';
import { getOrCreateSessionId } from '../lib/session';

export default function ChatInterface({ botId, botName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load chat history from session on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setError(null);
        const sessionId = getOrCreateSessionId();
        console.log('Loading chat history for bot', botId, 'with session', sessionId);
        
        const response = await fetch(`/api/chat/history?sessionId=${sessionId}&botId=${botId}`);
        
        if (response.ok) {
          const history = await response.json();
          console.log('Loaded history:', history);
          setMessages(history);
        } else {
          console.error('Error status:', response.status);
          const errorData = await response.text();
          console.error('Error loading chat history:', errorData);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        setError('Kunne ikke indlæse chat historik. Prøv at genindlæse siden.');
      }
    };
    
    loadChatHistory();
    
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [botId]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // Optimistically add user message to the UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const sessionId = getOrCreateSessionId();
      console.log('Sending message to bot', botId, 'with session', sessionId);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          botId,
          sessionId,
        }),
      });
      
      // First check the response status and content type
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers]));
      
      let data;
      // Clone the response to read it twice if needed
      const clonedResponse = response.clone();
      
      try {
        // Try to parse as JSON first
        console.log('Attempting to parse response as JSON...');
        data = await response.json();
        console.log('Successfully parsed response as JSON:', data);
        
        if (response.ok) {
          console.log('Received response:', data);
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } else {
          console.error('Error from API:', data.error || response.statusText);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: data.response || 'Beklager, der opstod en fejl. Prøv igen senere.' },
          ]);
          
          if (data.error) {
            setError(`Fejl: ${data.error}`);
          }
        }
      } catch (jsonError) {
        // If JSON parsing fails, handle the response as text
        console.error('Failed to parse response as JSON:', jsonError);
        try {
          const errorText = await clonedResponse.text();
          console.error('Raw response text:', errorText);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Beklager, serveren returnerede et ugyldigt svar.' },
          ]);
          setError(`Serverfejl: Kunne ikke fortolke svaret. ${jsonError.message}`);
        } catch (textError) {
          console.error('Failed to read response as text:', textError);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Beklager, kunne ikke læse serversvaret.' },
          ]);
          setError('Serverfejl: Kunne ikke læse svaret fra serveren.');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Beklager, der var en netværksfejl. Tjek din forbindelse.' },
      ]);
      setError('Netværksfejl: Kunne ikke forbinde til serveren');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FiCpu className="text-5xl mb-4" />
            <p className="text-lg">Start en samtale med botten</p>
            <p className="text-sm">Din chathistorik gemmes i 7 dage</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'user' ? (
                    <>
                      <span className="font-medium">Dig</span>
                      <FiUser className="text-sm" />
                    </>
                  ) : (
                    <>
                      <FiCpu className="text-sm" />
                      <span className="font-medium">{botName || `Bot #${botId}`}</span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2 max-w-[75%]">
              <div className="flex items-center gap-2 mb-1">
                <FiCpu className="text-sm" />
                <span className="font-medium">{botName || `Bot #${botId}`}</span>
              </div>
              <p className="animate-pulse">Tænker...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv din besked..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white rounded-r-lg px-4 py-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
}