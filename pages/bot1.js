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
      
      <header class="header">
        <h1 class="title">Hjem</h1>
      </header>
      <div class="navigation-bar">
        <button class="back-button">
          <i class="arrow-left"></i> Tilbage
        </button>
      </div>
      
      <ChatInterface botId={1} botName="Din Tilpassede Assistant" />
    </div>
  );
}