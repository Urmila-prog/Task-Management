import React from 'react';


const Sidebar = () => {
    const data = [
        {title: 'All Tasks'},
        {title: 'Important Tasks'},
        {title: 'completed Tasks'},
        {title: 'Incompleted Tasks'},

    ];
    return (
        <div className='flex flex-col '>
            <div>
                <h2 className='text-xl font-semibold'>The code master</h2>
                <h4 className='mb-1 text-gray-400'>urmila@gmail.com</h4>
                <hr />
            </div>
            <div>
                {data.map((item, i) => (
                    <div key={i} className='my-2'>{item.title}</div>
                ))}
            </div>
            <div>
                <button className='bg-gray-600 w-full p-2 rounded'>log out</button>
                </div>
        </div>
    );
};

export default Sidebar;