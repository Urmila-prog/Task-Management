import React, { useState, useEffect } from 'react';
import Cards from '../components/home/Cards';
import axios from 'axios';

const IncompletedTasks = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No authentication token found');
                    return;
                }

                const response = await axios.get("https://task-management-2qxv.onrender.com/api/v2/getincomtask", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.data) {
                    setData({ tasks: response.data.data });
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
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-300 text-xl mt-4">Loading tasks...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 text-xl mt-4">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Incomplete Tasks</h2>
            {data && data.tasks && data.tasks.length > 0 ? (
                <Cards home={'false'} data={data} />
            ) : (
                <div className='text-center text-gray-300 text-xl mt-4'>No incomplete tasks found.</div>
            )}
        </div>
    );
};

export default IncompletedTasks;