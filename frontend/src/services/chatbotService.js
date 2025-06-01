import axios from 'axios';

const API_URL = 'http://localhost:1000/api/v2';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessage = async (message) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to use the chatbot');
    }

    // Log the request details
    console.log('Making request to:', `${API_URL}/chat`);
    console.log('With message:', message);

    const response = await axios.post(`${API_URL}/chat`, 
      { message },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log successful response
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    // Log detailed error information
    console.log('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Provide user-friendly error messages
    if (error.response?.status === 401) {
      throw new Error('Please log in to use the chatbot');
    } else if (error.response?.status === 404) {
      throw new Error('Chat service is not available. Please try again later.');
    } else if (!error.response) {
      throw new Error('Cannot connect to the server. Please check if the server is running.');
    } else {
      throw new Error('Something went wrong. Please try again.');
    }
  }
};

export const getChatHistory = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching chat history from:', `${API_URL}/chat/history`);
    const response = await axios.get(`${API_URL}/chat/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Chat history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}; 