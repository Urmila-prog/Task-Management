const axios = require('axios');

// Test user credentials
const testUser = {
    email: "test@example.com",
    password: "test123"
};

async function testChat() {
    try {
        // First, login to get the token
        console.log('Logging in to get token...');
        const loginResponse = await axios.post('http://localhost:1000/api/v1/user/login', testUser);
        const token = loginResponse.data.token;

        if (!token) {
            console.error('Failed to get authentication token');
            return;
        }

        console.log('Successfully logged in. Testing chat endpoint...');

        // Test the chat endpoint
        const response = await axios.post('http://localhost:1000/api/v2/chat', 
            { message: "How can I manage my tasks better?" },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Chat Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testChat(); 