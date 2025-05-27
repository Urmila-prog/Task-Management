import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import axios from 'axios';

const EditTask = ({ editDiv, setEditDiv, task, onTaskUpdated }) => {
    const [formData, setFormData] = useState({
        title: '',
        desc: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                desc: task.desc
            });
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No authentication token found');
                return;
            }

            const response = await axios.put(
                `https://task-management-2qxv.onrender.com/api/v2/updatedtask/${task._id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.message === 'task updated successfully') {
                setFormData({ title: '', desc: '' });
                setEditDiv('hidden');
                if (onTaskUpdated) {
                    onTaskUpdated();
                }
            }
        } catch (error) {
            console.error('Error updating task:', error);
            alert(error.response?.data?.message || 'Failed to update task');
        }
    };

    return (
        <>
            <div className={`${editDiv} top-0 left-0 bg-gray-800 opacity-80 h-screen w-full`}>
            </div>
            <div className={`${editDiv} top-0 flex left-0 items-center justify-center h-screen w-full`}>
                <div className='w-2/6 bg-gray-500 p-4 rounded'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-xl font-semibold'>Edit Task</h2>
                        <button className='text-2xl' onClick={() => setEditDiv('hidden')}>
                            <IoClose />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder='Title'
                            name='title'
                            value={formData.title}
                            onChange={handleChange}
                            className='px-3 py-2 rounded w-full my-3 bg-gray-700'
                            required
                        />
                        <textarea
                            name="desc"
                            placeholder='Description...'
                            value={formData.desc}
                            onChange={handleChange}
                            className='px-3 py-2 rounded w-full bg-gray-700 my-3'
                            required
                        />
                        <button
                            type="submit"
                            className='px-3 py-2 bg-blue-400 rounded text-xl text-black font-semibold w-full hover:bg-blue-500 transition-colors duration-300'
                        >
                            Update Task
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditTask; 