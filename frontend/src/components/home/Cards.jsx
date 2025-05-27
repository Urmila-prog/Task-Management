import React, { useState, useEffect } from 'react';
import {CiHeart} from 'react-icons/ci';
import {FaEdit} from 'react-icons/fa';
import {MdDelete} from 'react-icons/md';
import { IoIosAddCircle } from "react-icons/io";
import axios from 'axios';
import EditTask from './EditTask';

const Cards = ({home, setInputDiv, data, onTaskUpdate}) => {
  const [tasks, setTasks] = useState(data?.tasks || []);
  const [updatingTask, setUpdatingTask] = useState(null);
  const [editDiv, setEditDiv] = useState('hidden');
  const [selectedTask, setSelectedTask] = useState(null);

  // Update tasks when data prop changes
  useEffect(() => {
    setTasks(data?.tasks || []);
  }, [data]);

  const handleCompleteTask = async(taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.put(`http://localhost:1000/api/v2/updatecomptask/${taskId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === 'task updated successfully') {
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { ...task, complete: !task.complete }
              : task
          )
        );
        // Notify parent component if callback exists
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task status. Please try again.');
    }
  }

  const handleImportantTask = async(taskId) => {
    try {
      setUpdatingTask(taskId);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.put(`http://localhost:1000/api/v2/updateimptask/${taskId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === 'task updated successfully') {
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { ...task, important: !task.important }
              : task
          )
        );
        // Notify parent component if callback exists
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }
    } catch (err) {
      console.error('Error updating task importance:', err);
      alert('Failed to update task importance. Please try again.');
    } finally {
      setUpdatingTask(null);
    }
  }

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setEditDiv('fixed');
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.delete(`http://localhost:1000/api/v2/deletetask/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === 'task deleted successfully') {
        // Update local state by removing the deleted task
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        // Notify parent component if callback exists
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  return (
    <>
      <div className='grid grid-cols-3 gap-4 p-4'>
        {tasks.map((card, idx) => (
          <div 
            key={idx} 
            className={`bg-gray-800 rounded-sm p-4 flex flex-col justify-between items-center 
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg
              animate-fadeIn ${card.important ? 'border-2 border-red-500' : ''}`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className='w-full'>
              <h3 className='text-xl font-semibold transition-colors duration-300 hover:text-blue-400'>{card.title}</h3>
              <p className='text-gray-300 my-2 transition-colors duration-300 hover:text-gray-100'>{card.desc}</p>
            </div>
            <div className='mt-4 flex w-full items-center gap-1'>
              <button 
                className={`${
                  card.complete ? 'bg-green-500' : 'bg-red-400'
                } px-2 py-1 rounded w-3/6 transition-all duration-300 
                hover:shadow-md hover:scale-105 active:scale-95`}
                onClick={() => handleCompleteTask(card._id)}
              >
                {card.complete ? 'Complete' : 'Incomplete'}
              </button>
              <div className='text-white px-2 py-1 w-3/6 text-xl flex justify-around'>
                <button 
                  onClick={() => handleImportantTask(card._id)}
                  disabled={updatingTask === card._id}
                  className={`transition-all duration-300 transform hover:scale-110 active:scale-95
                    ${card.important ? 'text-red-500 scale-110' : 'hover:text-red-400'}
                    ${updatingTask === card._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={card.important ? 'Mark as not important' : 'Mark as important'}
                >
                  <CiHeart/>
                </button>
                <button 
                  className='hover:text-blue-400 transition-all duration-300 transform hover:scale-110 active:scale-95' 
                  title='Edit task'
                  onClick={() => handleEditTask(card)}
                >
                  <FaEdit/>
                </button>
                <button 
                  className='hover:text-red-400 transition-all duration-300 transform hover:scale-110 active:scale-95' 
                  title='Delete task'
                  onClick={() => handleDeleteTask(card._id)}
                >
                  <MdDelete/>
                </button>
              </div>
            </div>
          </div>
        ))}
        {home === "true" && (
          <button 
            className='bg-gray-800 rounded-sm p-4 flex flex-col justify-between items-center 
              hover:scale-105 hover:cursor-pointer transition-all duration-300
              transform hover:shadow-lg animate-pulse hover:animate-none' 
            onClick={() => setInputDiv('fixed')}
          >
            <IoIosAddCircle className='text-5xl transition-transform duration-300 hover:rotate-90' />
            <h2 className='mt-2 transition-colors duration-300 hover:text-blue-400'>Add New Task</h2>
          </button>
        )}
      </div>
      {selectedTask && (
        <EditTask 
          editDiv={editDiv}
          setEditDiv={setEditDiv}
          task={selectedTask}
          onTaskUpdated={onTaskUpdate}
        />
      )}
    </>
  );
};

export default Cards;