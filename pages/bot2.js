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
      
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
          <FiArrowLeft />
          <span>Hjem</span>
        </Link>
      </div>
      
      <ChatInterface botId={2} botName="Standard GPT Bot" />
    </div>
  );
}