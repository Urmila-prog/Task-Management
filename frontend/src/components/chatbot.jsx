import React, { useState, useRef, useEffect } from 'react';
import { TbMessageChatbotFilled } from 'react-icons/tb';
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { IoSend } from 'react-icons/io5';
import { sendMessage, getChatHistory } from '../services/chatbotService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory();
        if (history && history.messages) {
          setMessages(history.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Add user message
      setMessages(prev => [...prev, { text: inputMessage, isBot: false }]);
      const userMessage = inputMessage;
      setInputMessage('');

      // Get bot response
      const response = await sendMessage(userMessage);
      if (response && response.message) {
        setMessages(prev => [...prev, { 
          text: response.message,
          isBot: true 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "I'm not sure how to help with that. Could you please rephrase your question?",
          isBot: true 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = "I'm having trouble understanding. Could you please try asking in a different way?";
      
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // No response received
        errorMessage = "I'm having trouble connecting to the server. Please check your internet connection and try again.";
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage,
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center hover:bg-gray-600 p-2 rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <TbMessageChatbotFilled className="text-2xl" />
        <div className="ml-2">
          <div>Chat</div>
          <div className="text-xs">with us</div>
        </div>
        {isOpen ? 
          <MdOutlineKeyboardArrowUp className="ml-auto" /> : 
          <MdOutlineKeyboardArrowDown className="ml-auto" />
        }
      </div>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-80 bg-gray-800 rounded-lg shadow-lg">
          <div className="h-96 flex flex-col">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? 'bg-gray-700 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-blue-500 text-white p-2 rounded-lg transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                  disabled={isLoading}
                >
                  <IoSend className="text-xl" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
