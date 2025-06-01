const router = require('express').Router();
const { getGeminiResponse } = require('../services/geminiService');

// Test chatbot endpoint without authentication
router.post('/chat', async (req, res) => {
    try {
        console.log('Test chat request received:', {
            body: req.body
        });

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ 
                message: 'Please provide a message to chat.' 
            });
        }

        // Get response from Gemini AI
        const response = await getGeminiResponse(message);

        res.status(200).json({ message: response });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ 
            message: 'Sorry, I encountered an error. Please try again.' 
        });
    }
});

module.exports = router; 