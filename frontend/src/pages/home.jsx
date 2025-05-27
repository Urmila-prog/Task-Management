import React, { useState } from 'react';
import Sidebar from '../components/home/sidebar';
import AllTasks from './AllTasks';
import ImportantTasks from './ImportantTasks';
import CompletedTask from './CompletedTask';
import IncompletedTasks from './IncompletedTasks';

const Home = () => {
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: 'All Tasks' },
        { id: 'important', label: 'Important Tasks' },
        { id: 'completed', label: 'Completed Tasks' },
        { id: 'incomplete', label: 'Incomplete Tasks' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'all':
                return <AllTasks />;
            case 'important':
                return <ImportantTasks />;
            case 'completed':
                return <CompletedTask />;
            case 'incomplete':
                return <IncompletedTasks />;
            default:
                return <AllTasks />;
        }
    };

    return (
        <div className='flex h-[98vh] gap-4 box-border'>
            <div className='w-1/6 border border-gray-500 rounded-xl p-4 flex flex-col box-border justify-between'>
                <Sidebar />
            </div>
            <div className='w-5/6 border border-gray-500 rounded-xl p-4'>
                <div className='mb-4'>
                    <div className='flex space-x-4 border-b border-gray-600'>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`px-4 py-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'text-blue-400 border-b-2 border-blue-400'
                                        : 'text-gray-400 hover:text-gray-300'
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='mt-4'>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Home;
