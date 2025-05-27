import React, { useState, useEffect } from 'react';
import Cards from '../components/home/Cards';
import InputData from '../components/home/InputData';
import { IoIosAddCircle } from "react-icons/io";
import axios from 'axios';

const AllTasks = () => {
  const [inputDiv, setInputDiv] = useState('hidden');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get("https://task-management-2qxv.onrender.com/api/v2/getalltask", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-300 text-xl mt-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-4">{error}</div>;
  }

  return (
    <>
      <div className='h-full flex flex-col'>
        <div className='w-full flex justify-end px-4 py-4'>
          <button onClick={() => setInputDiv('fixed')}>
            <IoIosAddCircle className='text-4xl text-gray-300 hover:text-gray-100 transition-all duration-300'/>
          </button>
        </div>
        <div className='flex-1 overflow-auto'>
          {data && data.tasks && data.tasks.length > 0 ? (
            <Cards 
              home={'true'} 
              setInputDiv={setInputDiv} 
              data={data}
              onTaskUpdate={fetchTasks}
            />
          ) : (
            <div className='text-center text-gray-300 text-xl mt-4'>No tasks found. Create your first task!</div>
          )}
        </div>
      </div>
      <InputData inputDiv={inputDiv} setInputDiv={setInputDiv} onTaskCreated={fetchTasks}/>
    </>
  );
};

export default AllTasks;