// Add this debug route to your app.js to test on deployed server
app.get('/debug/env', (req, res) => {
    res.json({
        hasGoogleApiKey: !!process.env.GOOGLE_AI_API_KEY,
        nodeEnv: process.env.NODE_ENV || 'development',
        keySample: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...' : 'not set'
    });
});
