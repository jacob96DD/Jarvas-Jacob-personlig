import Link from 'next/link';
import { FiMessageSquare, FiSettings } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Bestseller bydes velkommen til<span className="text-blue-600">Chat Appen</span>
        </h1>
        
        <p className="text-lg mb-8">
          Vælg en bot for at starte en samtale. Dine samtaler gemmes i 7 dage.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Link href="/bot1" className="group">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <FiMessageSquare className="text-purple-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold">Chat med Din Assistant</h2>
              <p className="text-gray-600 mt-2">Tilpasset OpenAI Assistant</p>
            </div>
          </Link>
          
          <Link href="/bot2" className="group">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FiMessageSquare className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold">Chat med Standard GPT</h2>
              <p className="text-gray-600 mt-2">Standard OpenAI GPT model</p>
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
          Chat-sessioner gemmes i 7 dage
        </p>
      </footer>
    </div>
  );
}