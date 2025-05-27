import React, { useEffect } from 'react';
import Sidebar from './components/home/sidebar';
import ImportantTasks from './pages/ImportantTasks';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AllTasks from './pages/AllTasks';
import CompletedTasks from './pages/CompletedTask';
import IncompletedTasks from './pages/IncompletedTasks';
import Signup from './pages/signup';
import Login from './pages/login';
import {useSelector} from 'react-redux';
// aloo
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  
  useEffect(() => {
    const publicPaths = ['/login', '/signup'];
    if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [navigate, isLoggedIn, location.pathname]);

  return (
    <div className='bg-gray-700 text-white h-screen p-2'>
      <div className='flex gap-2 h-full'>
        {isLoggedIn && (
          <div className='w-1/6 border border-gray-500 rounded-xl p-4 flex flex-col box-border justify-between'>
            <Sidebar />
          </div>
        )}
        <div className={`${isLoggedIn ? 'w-5/6' : 'w-full'} border border-gray-500 rounded-xl p-2`}>
          <Routes>
            <Route exact path="/" element={<AllTasks />} />
            <Route path="/importanttasks" element={<ImportantTasks />} />
            <Route path="/completedtasks" element={<CompletedTasks />} />
            <Route path="/incompletedtasks" element={<IncompletedTasks />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;