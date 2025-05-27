import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cards from '../components/home/Cards';

const ImportantTasks = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await axios.get('https://task-management-2qxv.onrender.com/api/v2/getimptask', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.data) {
                setData({ tasks: response.data.data });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError(error.response?.data?.message || 'Failed to fetch tasks');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Important Tasks</h1>
            {data.tasks && data.tasks.length > 0 ? (
                <Cards data={data} onTaskUpdate={fetchTasks} />
            ) : (
                <p className="text-center text-gray-500">No important tasks found</p>
            )}
        </div>
    );
};

export default ImportantTasks;