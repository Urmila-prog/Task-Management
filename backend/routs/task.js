const router = require('express').Router();
const Task = require('../models/tasks');
const User = require('../models/user');
const {authenticateToken} = require('../middleware/auth');
const Chat = require('../models/chat');
const { getGeminiResponse } = require('../services/geminiService');

// Helper function to get user ID from request
const getUserId = (req) => {
    return req.user?.id;
};

router.post('/createtask', authenticateToken, async(req, res) => {
    try {
        const { title, desc } = req.body;
        const userId = getUserId(req);
        
        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: 'User ID not found' });
        }

        const newtask = new Task({ title, desc });
        const saveTask = await newtask.save();
        const taskId = saveTask._id;
        
        await User.findByIdAndUpdate(userId, { $push: { tasks: taskId } });
        res.status(200).json({ message: 'task created successfully', task: saveTask });
    } catch (err) {
        console.error('Error creating task:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getalltask', authenticateToken, async (req, res) => {
    try {
        const userId = getUserId(req);
        console.log('Fetching tasks for user:', userId);
        
        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: 'User ID not found' });
        }
        
        const userData = await User.findById(userId).populate({
            path: 'tasks',
            options: { sort: { createdAt: -1 } }
        });

        if (!userData) {
            console.error('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Successfully fetched tasks for user:', userId);
        res.status(200).json({ data: userData });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/deletetask/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        await Task.findByIdAndDelete(id);
        await User.findByIdAndUpdate(userId, { $pull: { tasks: id } });
        res.status(200).json({ message: 'task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/updatedtask/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, desc } = req.body;
        const userId = getUserId(req);
        await Task.findByIdAndUpdate(id, { title: title, desc: desc });
        res.status(200).json({ message: 'task updated successfully' });
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/updateimptask/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const TaskData = await Task.findById(id);
        const isImportant = TaskData.important;
        const userId = getUserId(req);
        await Task.findByIdAndUpdate(id, { important: !isImportant });
        res.status(200).json({ message: 'task updated successfully' });
    } catch (err) {
        console.error('Error updating task importance:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/updatecomptask/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const TaskData = await Task.findById(id);
        const CompleteTask = TaskData.complete;
        const userId = getUserId(req);
        await Task.findByIdAndUpdate(id, { complete: !CompleteTask });
        res.status(200).json({ message: 'task updated successfully' });
    } catch (err) {
        console.error('Error updating task completion:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getimptask', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const Data = await User.findById(userId).populate({
            path: 'tasks',
            match: { important: true },
            options: { sort: { createdAt: -1 } }
        });
        const ImpTaskData = Data.tasks;
        res.status(200).json({ data: ImpTaskData });
    } catch (err) {
        console.error('Error fetching important tasks:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getcomtask', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const Data = await User.findById(userId).populate({
            path: 'tasks',
            match: { complete: true },
            options: { sort: { createdAt: -1 } }
        });
        const compTaskData = Data.tasks;
        res.status(200).json({ data: compTaskData });
    } catch (err) {
        console.error('Error fetching completed tasks:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getincomtask', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const Data = await User.findById(userId).populate({
            path: 'tasks',
            match: { complete: false },
            options: { sort: { createdAt: -1 } }
        });
        const IncompTaskData = Data.tasks;
        res.status(200).json({ data: IncompTaskData });
    } catch (err) {
        console.error('Error fetching incomplete tasks:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Chatbot endpoint with authentication
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const userId = getUserId(req);
        console.log('Chat request received:', {
            body: req.body,
            userId: userId
        });

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ 
                message: 'Please provide a message to chat.' 
            });
        }

        // Get response from Gemini AI with user's tasks
        const response = await getGeminiResponse(message, userId);

        // Save the chat message and response
        await Chat.findOneAndUpdate(
            { userId },
            { 
                $push: { 
                    messages: [
                        { text: message, isBot: false },
                        { text: response, isBot: true }
                    ]
                }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: response });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ 
            message: 'Sorry, I encountered an error. Please try again.' 
        });
    }
});

router.get('/chat/history', authenticateToken, async (req, res) => {
    try {
        const userId = getUserId(req);
        const chatHistory = await Chat.find({ userId })
            .sort({ createdAt: -1 })
            .limit(1);

        if (!chatHistory.length) {
            return res.status(200).json({ 
                messages: [
                    { text: "Hello! How can I help you today?", isBot: true }
                ]
            });
        }

        res.status(200).json({ messages: chatHistory[0].messages });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Test chatbot endpoint without authentication
router.post('/test-chat', async (req, res) => {
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