import Link from 'next/link';
import { FiMessageSquare, FiSettings } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">
        BESTSELLER TECH meet <span className="text-blue-600"> Jarvis</span>
        </h1>
        
        <p className="text-lg mb-8">
        Jacob's personal assistant for helping you make the right choice. Choose a bot to start a conversation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Link href="/bot1" className="group">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <FiMessageSquare className="text-purple-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold">Chat with you hiring assistant</h2>
              <p className="text-gray-600 mt-2">Ask which candidate you should hire.</p>
            </div>
          </Link>
          
          <Link href="/bot2" className="group">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FiMessageSquare className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold">Chat about Danish and European law</h2>
              <p className="text-gray-600 mt-2">Ask about the EU AI Act and does it affect my AI idea?</p>
            </div>
          </Link>
        </div>
        
        <div className="mt-12">
          <Link href="/admin/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <FiSettings /> Admin Dashboard
          </Link>
        </div>
      </main>
      
      <footer className="flex items-center justify-center w-full h-20 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          Chat-sessions will be saved in 7 days
        </p>
      </footer>
    </div>
  );
}