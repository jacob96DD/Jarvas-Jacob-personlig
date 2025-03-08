// Direct implementation using fetch

// Get response from an OpenAI Assistant
export async function getAssistantResponseDirect(assistantId, messages, apiKey) {
  try {
    console.log('Using Assistant ID:', assistantId);
    console.log('Sending messages to Assistant API:', JSON.stringify(messages));
    
    // 1. Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });
    
    if (!threadResponse.ok) {
      const errorData = await threadResponse.text();
      throw new Error(`Failed to create thread: ${errorData}`);
    }
    
    const thread = await threadResponse.json();
    const threadId = thread.id;
    console.log('Created thread:', threadId);
    
    // 2. Add messages to the thread
    const userMessage = messages[messages.length - 1].content;
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: userMessage
      })
    });
    
    if (!messageResponse.ok) {
      const errorData = await messageResponse.text();
      throw new Error(`Failed to add message: ${errorData}`);
    }
    
    console.log('Added message to thread');
    
    // 3. Run the assistant on the thread
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });
    
    if (!runResponse.ok) {
      const errorData = await runResponse.text();
      throw new Error(`Failed to run assistant: ${errorData}`);
    }
    
    const run = await runResponse.json();
    const runId = run.id;
    console.log('Created run:', runId);
    
    // 4. Poll for the run completion
    let runStatus = { status: 'queued' };
    let attempts = 0;
    const maxAttempts = 60; // Max poll attempts (1 minute at 1 second interval)
    
    while (!['completed', 'failed', 'cancelled', 'expired'].includes(runStatus.status) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.text();
        throw new Error(`Failed to check run status: ${errorData}`);
      }
      
      runStatus = await statusResponse.json();
      console.log('Run status:', runStatus.status);
      attempts++;
    }
    
    if (runStatus.status !== 'completed') {
      throw new Error(`Run did not complete. Final status: ${runStatus.status}`);
    }
    
    // 5. Get the messages from the thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text();
      throw new Error(`Failed to get messages: ${errorData}`);
    }
    
    const messageList = await messagesResponse.json();
    console.log('Got message list');
    
    // Return the latest assistant message
    const assistantMessages = messageList.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length > 0 && assistantMessages[0].content && assistantMessages[0].content.length > 0) {
      const firstContent = assistantMessages[0].content[0];
      
      if (firstContent.type === 'text' && firstContent.text && firstContent.text.value) {
        const responseContent = firstContent.text.value;
        console.log('Got assistant response:', responseContent.substring(0, 50) + '...');
        return responseContent;
      } else {
        console.error('Unexpected response structure:', JSON.stringify(assistantMessages[0].content));
        return "Beklager, jeg modtog et uventet svarformat fra assistenten.";
      }
    } else {
      return "Beklager, jeg kunne ikke generere et svar.";
    }
  } catch (error) {
    console.error('Error with OpenAI Assistant API:', error);
    
    // More robust error handling
    let errorMessage;
    try {
      // Attempt to get a usable error message
      errorMessage = error.message || 'Unknown error';
    } catch (e) {
      errorMessage = 'Could not extract error message';
    }
    
    return `Fejl ved forbindelse til OpenAI Assistant: ${errorMessage}`;
  }
}