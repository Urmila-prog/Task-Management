import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { authActions } from '../store/auth';
import GoogleLoginComponent from '../components/GoogleLogin';

const Login = () => {
  const [data, setData] = useState({username:'', password:''});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useNavigate();
  const dispatch = useDispatch();
  
  const change = (e) => {
    const {name, value} = e.target;
    setData({ ...data, [name]:value});
    setError(''); // Clear error when user types
  };

  const submit = async() => {
    if(data.username === "" || data.password === "") {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { username: data.username });
      const response = await axios.post('https://task-management-2qxv.onrender.com/api/v1/user/login', data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      console.log('Login response:', response.data);
      
      if (response?.data) {
        setData({ username: "", password: "" });
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("token", response.data.token);
        dispatch(authActions.login());
        history('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else if (error.response.status === 404) {
          setError('Login endpoint not found. Please check server configuration.');
        } else {
          setError(error.response.data?.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Please check if the server is running at https://task-management-2qxv.onrender.com');
      } else {
        // Error in request setup
        setError('An error occurred while trying to log in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[98vh] flex items-center justify-center p-4'>
      <div className='w-full max-w-md p-6 rounded bg-gray-800'>
        <div className='text-2xl font-semibold mb-4'>Login</div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 my-2 rounded text-sm">
            {error}
          </div>
        )}

        <input 
          type="text" 
          placeholder='username' 
          className='bg-gray-700 px-3 py-2 my-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400' 
          name='username' 
          value={data.username} 
          onChange={change}
          disabled={isLoading}
        />
        <input 
          type="password" 
          placeholder='password' 
          className='bg-gray-700 px-3 py-2 my-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400' 
          name='password' 
          value={data.password} 
          onChange={change}
          disabled={isLoading}
        />
        <div className='w-full flex flex-col gap-3 mt-4'>
          <button 
            className={`bg-blue-400 text-xl font-semibold text-black px-3 py-2 rounded transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
            }`}
            onClick={submit}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          <GoogleLoginComponent />

          <div className='text-center'>
            <Link 
              to='/signup' 
              className='text-blue-400 hover:text-blue-300 font-medium transition-colors'
            >
              Don't have an account? Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;