import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename');

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Upload to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
    });

    console.log('File uploaded to Vercel Blob:', blob);

    // Return the blob data including the URL
    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
}