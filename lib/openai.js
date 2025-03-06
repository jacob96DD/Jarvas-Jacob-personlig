import OpenAI from 'openai';

// Get chat completion for standard OpenAI models
export async function getChatCompletion(messages, model = 'gpt-3.5-turbo') {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('Using OpenAI API key:', process.env.OPENAI_API_KEY?.substring(0, 5) + '...');
    console.log('Sending messages to OpenAI:', JSON.stringify(messages));
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return `Fejl ved forbindelse til OpenAI: ${error.message}`;
  }
}

// Get response from an OpenAI Assistant
export async function getAssistantResponse(assistantId, messages) {
  try {
    console.log('Using Assistant API key:', process.env.OPENAI_ASSISTANT_API_KEY?.substring(0, 5) + '...');
    console.log('Using Assistant ID:', assistantId);
    console.log('Sending messages to Assistant API:', JSON.stringify(messages));
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_ASSISTANT_API_KEY || process.env.OPENAI_API_KEY,
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2' // Tilføj header for v2 Assistant API
      }
    });
    
    console.log('Using API headers with OpenAI-Beta: assistants=v2');
    
    // Create a thread
    const thread = await openai.beta.threads.create();
    console.log('Created thread:', thread.id);
    
    // Add messages to the thread
    for (const message of messages) {
      if (message.role === 'user') {
        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: message.content,
        });
      }
    }
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });
    console.log('Created run:', run.id);
    
    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log('Initial run status:', runStatus.status);
    
    let attempts = 0;
    const maxAttempts = 30; // Maximum polling attempts
    
    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run status: ${runStatus.status}`);
      }
      
      // Wait for 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Updated run status:', runStatus.status);
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Timed out waiting for assistant response');
    }
    
    // Get the messages from the thread
    const messageList = await openai.beta.threads.messages.list(thread.id);
    
    // Return the latest assistant message
    const assistantMessages = messageList.data.filter(
      msg => msg.role === 'assistant'
    );
    
    if (assistantMessages.length > 0 && assistantMessages[0].content && assistantMessages[0].content.length > 0) {
      const firstContent = assistantMessages[0].content[0];
      
      // Check if the content has the expected structure
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
    return `Fejl ved forbindelse til OpenAI Assistant: ${error.message}`;
  }
}