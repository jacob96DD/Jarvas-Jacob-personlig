import { getChatCompletion } from '../../../lib/openai';
import { getAssistantResponseDirect } from '../../../lib/openai-direct';
import { saveConversation, saveBotResponse } from '../../../lib/db';
import { getSessionFromRequest, setSessionInResponse } from '../../../lib/session';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Available environment variables:', {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY ? .substring(0, 5) + '...',
            OPENAI_ASSISTANT_API_KEY: process.env.OPENAI_ASSISTANT_API_KEY ? .substring(0, 5) + '...',
            OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID,
        });

        const { message, botId, sessionId: clientSessionId } = req.body;

        if (!message || !botId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Use session ID from the request or the one provided by the client
        const sessionId = getSessionFromRequest(req) || clientSessionId;
        setSessionInResponse(res, sessionId);

        let conversationId;
        try {
            // Save user message to the database
            conversationId = await saveConversation(sessionId, parseInt(botId), message);
        } catch (dbError) {
            console.error('Database error:', dbError);
            // Continue without database for testing
            conversationId = 1;
        }

        // Generate response based on bot ID
        let botResponse;

        // Definer din assistent's ID - hardcoded for at sikre os
        const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
        const ASSISTANT_API_KEY = process.env.OPENAI_ASSISTANT_API_KEY;

        if (parseInt(botId) === 1) {
            // Bot 1: Brug din Assistant med direct fetch implementation
            console.log('Using Direct Assistant API for Bot 1 with Assistant ID:', ASSISTANT_ID);

            const messages = [{ role: 'user', content: message }];
            botResponse = await getAssistantResponseDirect(ASSISTANT_ID, messages, ASSISTANT_API_KEY);
        } else if (parseInt(botId) === 2) {
            // Bot 2: Use your custom Assistant with direct fetch implementation
            console.log('Using Direct Assistant API for Bot 2 with Assistant ID:', ASSISTANT_ID_erhversjurist);

            const messages = [{ role: 'user', content: message }];
            botResponse = await getAssistantResponseDirect(ASSISTANT_ID_erhversjurist, messages, process.env.OPENAI_ASSISTANT_API_KEY);
        } else {
            return res.status(400).json({ error: 'Invalid bot ID' });
        }

        try {
            // Save bot response to the database
            await saveBotResponse(conversationId, botResponse);
        } catch (dbError) {
            console.error('Database error when saving response:', dbError);
            // Continue without database for testing
        }

        return res.status(200).json({ response: botResponse });
    } catch (error) {
        console.error('Error in chat API:', error);

        // Add debugging for the error object
        console.error('Error type:', typeof error);
        console.error('Error is instance of Error:', error instanceof Error);
        console.error('Error properties:', Object.keys(error));
        console.error('Error stack:', error.stack);

        try {
            // Make sure we properly return a JSON response even in error cases
            return res.status(500).json({
                response: `Der opstod en fejl: ${error.message}`,
                error: error.message
            });
        } catch (jsonError) {
            console.error('Failed to serialize error as JSON:', jsonError);
            // Fallback to a basic JSON response if we can't serialize the error
            return res.status(500).json({
                response: 'Der opstod en fejl på serveren.',
                error: 'Intern serverfejl'
            });
        }
    }
}