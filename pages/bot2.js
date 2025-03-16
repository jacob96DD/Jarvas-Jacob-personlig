import Link from 'next/link';
import ChatInterface from '../components/ChatInterface';
import { FiArrowLeft } from 'react-icons/fi';
import Head from 'next/head';

export default function Bot2() {
  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Chat med Standard GPT | Chat App</title>
      </Head>
      
      {/* Blå header med bottens navn */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-semibold">Standard GPT Bot</h1>
        </div>
      </header>
      
      {/* Tilbageknap under headeren */}
      <div className="bg-gray-50 py-3 px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors w-fit">
          <FiArrowLeft className="text-lg" />
          <span>Tilbage til forsiden</span>
        </Link>
      </div>
      
      <ChatInterface botId={2} botName="Standard GPT Bot" />
    </div>
  );
}