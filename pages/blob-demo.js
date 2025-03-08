import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiLoader } from 'react-icons/fi';
import Head from 'next/head';

export default function BlobDemo() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTextBlob = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/blob-example');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API fejl: ${errorText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Fejl ved blob oprettelse:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Vercel Blob Demo | Chat App</title>
      </Head>
      
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
          <FiArrowLeft />
          <span>Hjem</span>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Vercel Blob Demo</h1>
          
          <p className="text-gray-700 mb-6">
            Denne demo opretter en simpel tekstfil direkte i Vercel Blob storage.
            Klik på knappen for at oprette en text fil og få et link til at se den.
          </p>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <button
            onClick={createTextBlob}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md flex items-center justify-center ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Opretter...
              </>
            ) : (
              'Opret Tekstfil i Blob Storage'
            )}
          </button>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center text-green-600 mb-3">
                <FiCheck className="mr-2" />
                <span className="font-medium">Fil oprettet!</span>
              </div>
              
              <p className="mb-1 text-sm font-medium">Fil URL:</p>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 truncate hover:underline"
              >
                {result.url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}