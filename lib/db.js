import { put, list, del } from '@vercel/blob';

// Gem samtale og brugerbesked
export async function saveConversation(sessionId, botId, message) {
  try {
    const conversationId = `${sessionId}-${botId}`;
    const blobName = `conversations/${conversationId}.json`;
    
    // Tjek om samtalen allerede eksisterer
    let conversation;
    try {
      const { url } = await put(blobName, '', { access: 'public' });
      const existingData = await fetch(url);
      
      if (existingData.ok) {
        conversation = await existingData.json();
      }
    } catch (error) {
      console.log('Ingen eksisterende samtale fundet:', error.message);
    }
    
    // Opret ny samtale eller tilføj til eksisterende
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dage
    
    if (!conversation) {
      // Ny samtale
      conversation = {
        id: conversationId,
        sessionId,
        botId,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        messages: []
      };
    }
    
    // Tilføj brugerbesked
    conversation.messages.push({
      role: 'user',
      content: message,
      createdAt: new Date().toISOString()
    });
    
    // Gem opdateret samtale
    await put(blobName, JSON.stringify(conversation), {
      access: 'public',
      contentType: 'application/json',
      expiresAt
    });
    
    return conversationId;
  } catch (error) {
    console.error('Fejl ved gemning af samtale:', error);
    throw error;
  }
}

// Gem botrespons
export async function saveBotResponse(conversationId, response) {
  try {
    const blobName = `conversations/${conversationId}.json`;
    
    // Hent eksisterende samtale
    const blobs = await list({ prefix: blobName });
    
    if (blobs.blobs.length === 0) {
      throw new Error(`Kunne ikke finde samtale ${conversationId}`);
    }
    
    const latestBlob = blobs.blobs[0];
    const existingData = await fetch(latestBlob.url);
    const conversation = await existingData.json();
    
    // Tilføj botrespons
    conversation.messages.push({
      role: 'assistant',
      content: response,
      createdAt: new Date().toISOString()
    });
    
    // Gem opdateret samtale
    await put(blobName, JSON.stringify(conversation), {
      access: 'public',
      contentType: 'application/json',
      expiresAt: new Date(conversation.expiresAt)
    });
    
    return conversation;
  } catch (error) {
    console.error('Fejl ved gemning af botrespons:', error);
    throw error;
  }
}

// Hent samtalehistorik
export async function getConversationHistory(sessionId, botId) {
  try {
    const conversationId = `${sessionId}-${botId}`;
    const blobName = `conversations/${conversationId}.json`;
    
    // List alle blobs der matcher samtalen
    const { blobs } = await list({ prefix: blobName });
    
    if (blobs.length === 0) return [];
    
    // Hent den nyeste samtale
    const response = await fetch(blobs[0].url);
    const conversation = await response.json();
    
    return conversation.messages;
  } catch (error) {
    console.error('Fejl ved hentning af samtalehistorik:', error);
    return [];
  }
}

// Hent alle samtaler (til admin-dashboard)
export async function getAllConversations() {
  try {
    const { blobs } = await list({ prefix: 'conversations/' });
    
    if (blobs.length === 0) return [];
    
    // Hent alle samtaler
    const conversations = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        return await response.json();
      })
    );
    
    return conversations;
  } catch (error) {
    console.error('Fejl ved hentning af alle samtaler:', error);
    return [];
  }
}

// Hent samtale efter ID
export async function getConversationById(id) {
  try {
    // Hvis ID er et filnavn eller fuld sti, skal vi korrigere det
    const conversationId = id.includes('/') ? id.split('/').pop().replace('.json', '') : id;
    const blobName = `conversations/${conversationId}.json`;
    
    // List alle blobs der matcher ID'et
    const { blobs } = await list({ prefix: blobName });
    
    if (blobs.length === 0) {
      // Prøv direkte at hente med ID'et, hvis det er fuldt ID
      const directBlobs = await list({ prefix: `conversations/${id}` });
      if (directBlobs.blobs.length === 0) return null;
      
      const response = await fetch(directBlobs.blobs[0].url);
      return await response.json();
    }
    
    // Hent samtalen
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (error) {
    console.error('Fejl ved hentning af samtale efter ID:', error);
    return null;
  }
}