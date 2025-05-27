import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { authActions } from '../store/auth';

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
      const response = await axios.post('http://localhost:1000/api/v1/login', data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
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
      console.error('Login error:', error);
      
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
        setError('Cannot connect to server. Please check if the server is running at http://localhost:1000');
      } else {
        // Error in request setup
        setError('An error occurred while trying to log in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-[98vh] flex items-center justify-center'>
      <div className='p-4 w-2/6 rounded bg-gray-800'>
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