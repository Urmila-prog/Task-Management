import React, { useState, useEffect } from 'react';
import {CgNotes} from 'react-icons/cg';
import {MdLabelImportant} from 'react-icons/md';
import {FaCheckDouble} from 'react-icons/fa';
import {TbNotebookOff} from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { authActions } from '../../store/auth';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('id');
                const token = localStorage.getItem('token');
                
                if (!userId || !token) {
                    console.log('No user ID or token found, redirecting to login...');
                    dispatch(authActions.logout());
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:1000/api/v1/user/${userId}`, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error.response?.data || error.message);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    dispatch(authActions.logout());
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [dispatch, navigate]);

    const data = [
        {title: 'All Tasks', icon: <CgNotes/>,
            link:'/',
        },
        {title: 'Important Tasks', icon: <MdLabelImportant/>,
            link:'/importanttasks',
        },
        {title: 'completed Tasks', icon:<FaCheckDouble/>, 
            link:'/completedtasks',
        },
        {title: 'Incompleted Tasks', icon:<TbNotebookOff/>, 
            link:'/incompletedtasks',
        },
    ];

    const logout = () => {
        dispatch(authActions.logout());
        localStorage.removeItem('id');
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <>
            <div>
                <h2 className='text-xl font-semibold'>
                    {isLoading ? 'Loading...' : userData?.username || 'User'}
                </h2>
                <h4 className='mb-1 text-gray-400'>
                    {isLoading ? 'Loading...' : userData?.email || 'No email'}
                </h4>
                <hr />
            </div>
            <div>
                {data.map((item, i) => (
                    <Link 
                        to={item.link} 
                        key={i} 
                        className='my-2 flex items-center hover:bg-gray-600 p-2 rounded'
                    >
                        {item.icon}&nbsp;{item.title}
                    </Link>
                ))}
            </div>
            <div className='mt-auto'>
                <button 
                    className='bg-gray-600 w-full p-2 rounded hover:bg-gray-500 transition-colors' 
                    onClick={logout}
                >
                    Log out
                </button>
            </div>
        </>
    );
};

export default Sidebar;