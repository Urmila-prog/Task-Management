const router = require('express').Router();
const Task = require('../models/tasks');
const User = require('../models/user');
const {authenticateToken} = require('../middleware/auth');

// Helper function to get user ID from request
const getUserId = (req) => {
    return req.user?.id || req.headers.id;
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

router.delete('/deletetask/:id', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const userId = getUserId(req);
    await Task.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, {$pull: {tasks:id}});
    res.status(200).json({data: userData});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/updatedtask/:id', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const {title, desc} = req.body;
    const userId = getUserId(req);
    await Task.findByIdAndUpdate(id, {title: title, desc:desc});
    res.status(200).json({meaasge: 'task updated successfully'});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/updateimptask/:id', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const TaskData = await Task.findById(id);
    const ImpTask = TaskData.imporatnt;
    const userId = getUserId(req);
    await Task.findByIdAndUpdate(id, {important:'!ImpTask'});
    res.status(200).json({meaasge: 'task updated successfully'});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/updatecomptask/:id', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const TaskData = await Task.findById(id);
    const CompleteTask = TaskData.complete;
    const userId = getUserId(req);
    await Task.findByIdAndUpdate(id, {important:'!CompleteTask'});
    res.status(200).json({meaasge: 'task updated successfully'});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/getimptask', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const userId = getUserId(req);
    const Data = await User.findById(userId).populate({
    path:'tasks',
    match: {imporatant: true},
    options: {sort: {createdAt:-1}},
   });
   const ImpTaskData = Data.tasks;
    res.status(200).json({data: ImpTaskData});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/geticomtask', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const userId = getUserId(req);
    const Data = await User.findById(userId).populate({
    path:'tasks',
    match: {complete: true},
    options: {sort: {createdAt:-1}},
   });
   const compTaskData = Data.tasks;
    res.status(200).json({data: compTaskData});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/getincomtask', authenticateToken, async (req, res)=>{
  try{
    const {id} = req.params;
    const userId = getUserId(req);
    const Data = await User.findById(userId).populate({
    path:'tasks',
    match: {complete: false},
    options: {sort: {createdAt:-1}},
   });
   const IncompTaskData = Data.tasks;
    res.status(200).json({data: IncompTaskData});
  }catch (err) {
    console.error(' error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;