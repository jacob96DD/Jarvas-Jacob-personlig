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
      
      <div className="flex items-center justify-center p-4 bg-blue-500 text-white">
        <Link href="/" className="absolute left-4 flex items-center gap-1 hover:text-gray-200 transition-colors">
          <FiArrowLeft />
          <span>Hjem</span>
        </Link>
        <h1 className="text-lg">Erhvervsjura beta GPT Bot</h1>
      </div>
      
      <ChatInterface botId={2} botName="jarvis law" />
    </div>
  );
}