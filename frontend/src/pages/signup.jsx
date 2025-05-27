import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const history = useNavigate();
  const [data, setData] = useState({username:'', email:'', password:''});
  const change = (e) =>{
    const {name, value} = e.target;
    setData({ ...data, [name]:value});
  };
  const submit = async()=> {
    if(data.username === "" || data.email === "" || data.password === ""){
      alert('All fields are required');
      return;
    } else {
      try {
        const response = await axios.post('http://localhost:1000/api/v1/signup', data);
        setData({ username: "", email: "", password:"" });
        alert(response.data.message);
        history('/login');
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          alert(error.response.data.message || 'Signup failed. Please try again.');
        } else if (error.request) {
          // The request was made but no response was received
          alert('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          alert('An error occurred. Please try again.');
        }
      }
    }
  };

    return (
        <div className='h-[98vh] flex items-center justify-center'>
          <div className='p-4 w-2/6 rounded bg-gray-800'>
            <div className='text-2xl font-semibold mb-4'>SignUp</div>
            <input type="text" placeholder='username' className='bg-gray-700 px-3 py-2 my-3 w-full rounded' name='username' value={data.username} onChange={change} />
            <input type="email" placeholder='email' className='bg-gray-700 px-3 py-2 my-3 w-full rounded' name='email' value={data.email} onChange={change}/>
            <input type="password" placeholder='password' className='bg-gray-700 px-3 py-2 my-3 w-full rounded' name='password' value={data.password} onChange={change} />
            <div className='w-full flex flex-col gap-3 mt-4'>
              <button 
                className='bg-blue-400 text-xl font-semibold text-black px-3 py-2 rounded hover:bg-blue-500 transition-colors' 
                onClick={submit}
              >
                SignUp
              </button>
              <div className='text-center'>
                <Link 
                  to='/login' 
                  className='text-blue-400 hover:text-blue-300 font-medium transition-colors'
                >
                  Already have an account? Login here
                </Link>
              </div>
            </div>
          </div>
        </div>
    );
};

export default Signup;