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
      
      <header className="header">
        <h1 className="title">Hjem</h1>
      </header>
      <div className="navigation-bar">
        <button className="back-button">
          <i className="arrow-left"></i> Tilbage
        </button>
      </div>
      
      <ChatInterface botId={2} botName="Standard GPT Bot" />
    </div>
  );
}