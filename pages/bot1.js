import Link from 'next/link';
import ChatInterface from '../components/ChatInterface';
import { FiArrowLeft } from 'react-icons/fi';
import Head from 'next/head';

export default function Bot1() {
  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Chat med Din Assistant | Chat App</title>
      </Head>
      
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors w-fit">
            <FiArrowLeft className="text-lg" />
            <span>Tilbage til forsiden</span>
          </Link>
        </div>
      </header>
      
      <ChatInterface botId={1} botName="Din Tilpassede Assistant" />
    </div>
  );
}