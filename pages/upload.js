'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import Head from 'next/head';

export default function FileUploadPage() {
  const inputFileRef = useRef(null);
  const [blob, setBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!inputFileRef.current?.files) {
        throw new Error("Ingen fil valgt");
      }

      const file = inputFileRef.current.files[0];

      const response = await fetch(
        `/api/upload?filename=${file.name}`,
        {
          method: 'POST',
          body: file,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload fejlede: ${errorText}`);
      }

      const newBlob = await response.json();
      setBlob(newBlob);
    } catch (err) {
      console.error('Upload fejl:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Upload Fil | Chat App</title>
      </Head>
      
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
          <FiArrowLeft />
          <span>Hjem</span>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Upload Fil</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Vælg fil
              </label>
              <input
                id="file"
                name="file"
                ref={inputFileRef}
                type="file"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Uploader...' : 'Upload Fil'}
            </button>
          </form>
          
          {blob && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-medium mb-2">Upload gennemført!</h2>
              <p className="mb-1 text-sm font-medium">Fil URL:</p>
              <a 
                href={blob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 truncate hover:underline"
              >
                {blob.url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}