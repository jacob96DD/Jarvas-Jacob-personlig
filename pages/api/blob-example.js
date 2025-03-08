import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Example of uploading a simple text file directly
    const { url } = await put('examples/text-example.txt', 'Dette er et eksempel på en tekst gemt i Vercel Blob!', {
      access: 'public',
    });

    console.log('Text file uploaded to Vercel Blob:', url);

    // Return the URL of the uploaded file
    return res.status(200).json({
      message: 'Text file uploaded successfully',
      url: url
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
}