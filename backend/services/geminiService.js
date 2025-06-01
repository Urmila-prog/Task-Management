const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/user');
const Task = require('../models/tasks');

// Initialize the Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Task management system context
const SYSTEM_CONTEXT = `You are a helpful task management assistant. Your role is to help users manage their tasks effectively.
You can help with:
1. Creating and organizing tasks
2. Setting priorities
3. Managing deadlines
4. Task categorization
5. Productivity tips
6. Task management best practices

Please format your responses using markdown:
- Use **bold** for emphasis
- Use *italic* for secondary emphasis
- Use bullet points (-) for lists
- Use numbered lists (1.) for steps
- Use \`code\` for technical terms
- Use > for important notes or tips
- Use # for section headers
- Use --- for section separators

Keep your responses concise, practical, and focused on task management.`;

async function getUserTasks(userId) {
    try {
        const userData = await User.findById(userId).populate({
            path: 'tasks',
            options: { sort: { createdAt: -1 } }
        });

        if (!userData || !userData.tasks) {
            return [];
        }

        return userData.tasks.map(task => ({
            title: task.title,
            description: task.desc,
            important: task.important,
            complete: task.complete,
            createdAt: task.createdAt
        }));
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        return [];
    }
}

async function getGeminiResponse(userMessage, userId) {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.error('Google AI API key is not set');
            throw new Error('AI service is not properly configured');
        }

        // Fetch user's tasks
        const userTasks = await getUserTasks(userId);
        console.log('Fetched user tasks:', userTasks);

        // Create task context for the AI
        const taskContext = userTasks.length > 0 
            ? `Here are the user's current tasks:\n${JSON.stringify(userTasks, null, 2)}\n\nPlease provide personalized advice based on these tasks. Format your response using markdown.`
            : "The user has no tasks yet. Please provide general task management advice. Format your response using markdown.";

        // Get the Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create a chat session with proper history format
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_CONTEXT + "\n\n" + taskContext }]
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I'm ready to help with task management. I'll format my responses using markdown for better readability." }]
                }
            ]
        });

        console.log('Sending message to Gemini:', userMessage);

        // Send the message and get the response
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        
        if (!response || !response.text()) {
            throw new Error('No response received from AI model');
        }

        console.log('Received response from Gemini:', response.text());
        return response.text();
    } catch (error) {
        console.error('Error getting Gemini response:', {
            message: error.message,
            stack: error.stack,
            apiKey: process.env.GOOGLE_AI_API_KEY ? 'Set' : 'Not Set'
        });

        if (error.message.includes('API key')) {
            throw new Error('AI service is not properly configured. Please contact support.');
        } else if (error.message.includes('model')) {
            throw new Error('AI model is currently unavailable. Please try again later.');
        } else {
            throw new Error('I encountered an error while processing your request. Please try again.');
        }
    }
}

module.exports = {
    getGeminiResponse
}; 