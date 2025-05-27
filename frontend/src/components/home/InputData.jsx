import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import axios from 'axios';

const InputData = ({ inputDiv, setInputDiv, onTaskCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        desc: ''
    });

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

            const response = await axios.post(
                'http://localhost:1000/api/v2/createtask',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.message === 'task created successfully') {
                setFormData({ title: '', desc: '' });
                setInputDiv('hidden');
                if (onTaskCreated) {
                    onTaskCreated();
                }
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert(error.response?.data?.message || 'Failed to create task');
        }
    };

    return (
        <>
            <div className={`${inputDiv} top-0 left-0 bg-gray-800 opacity-80 h-screen w-full`}>
            </div>
            <div className={`${inputDiv} top-0 flex left-0 items-center justify-center h-screen w-full`}>
                <div className='w-2/6 bg-gray-500 p-4 rounded'>
                    <div className='flex justify-end'>
                        <button className='text-2xl' onClick={() => setInputDiv('hidden')}> <IoClose /></button>
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
                            className='px-3 py-2 bg-blue-400 rounded text-xl text-black font-semibold w-full'
                        >
                            Create Task
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default InputData;