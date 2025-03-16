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
    console.log('Henter alle samtaler fra Blob Storage');
    
    // Hent alle blobs i conversations-mappen
    const { blobs } = await list({ prefix: 'conversations/' });
    
    console.log(`Fandt ${blobs.length} samtaler i blob storage`);
    
    if (blobs.length === 0) return [];
    
    // Hent data for hver samtale
    const conversations = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          
          if (!response.ok) {
            console.error(`Fejl ved hentning af blob (${response.status}): ${blob.url}`);
            return null;
          }
          
          const data = await response.json();
          
          // Tilføj blob-metadata
          return {
            ...data,
            blobUrl: blob.url,
            blobPath: blob.pathname,
            // Sikre at vi har et timestamp, selv hvis data mangler
            timestamp: data.updatedAt || data.createdAt || blob.uploadedAt || new Date().toISOString()
          };
        } catch (error) {
          console.error(`Fejl ved parsing af blob ${blob.url}:`, error);
          return null;
        }
      })
    );
    
    // Fjern null-værdier
    const validConversations = conversations.filter(c => c !== null);
    
    // Log information om datoer for fejlfinding
    validConversations.forEach(conv => {
      console.log(`Samtale ${conv.id}: createdAt=${conv.createdAt}, updatedAt=${conv.updatedAt}, timestamp=${conv.timestamp}`);
    });
    
    // Mere robust sorteringsfunktion
    const sortedConversations = validConversations.sort((a, b) => {
      // Brug beregnede timestamp til sortering
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      
      // Håndter ugyldige datoer
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1; // a kommer sidst
      if (isNaN(timeB)) return -1; // b kommer sidst
      
      // Nyeste først
      return timeB - timeA;
    });
    
    console.log(`Returnerer ${sortedConversations.length} sorterede samtaler`);
    
    return sortedConversations;
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
    
    console.log(`Søger efter blob: ${blobName}`);
    
    // List alle blobs der matcher ID'et
    const { blobs } = await list({ prefix: blobName });
    
    if (blobs.length === 0) {
      console.log(`Ingen blobs fundet med ${blobName}, prøver bredere søgning`);
      // Prøv med en bredere søgning
      const { blobs: allBlobs } = await list({ prefix: 'conversations/' });
      const matchingBlob = allBlobs.find(b => 
        b.url.includes(conversationId) || 
        b.pathname.includes(conversationId)
      );
      
      if (!matchingBlob) {
        console.log(`Ingen samtale fundet med ID: ${id}`);
        return null;
      }
      
      const response = await fetch(matchingBlob.url);
      return await response.json();
    }
    
    // Hent samtalen
    const response = await fetch(blobs[0].url);
    const conversation = await response.json();
    
    console.log(`Samtale fundet: ${conversation.id} med ${conversation.messages?.length || 0} beskeder`);
    
    return conversation;
  } catch (error) {
    console.error('Fejl ved hentning af samtale efter ID:', error);
    return null;
  }
}