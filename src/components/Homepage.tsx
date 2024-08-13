// src/component/Homepage.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHomepage } from '@/context/HomepageContext';

const Homepage = () => {
  const navigate = useRouter();
  const {
    userName,
    setName,
    nameBoxHandler,
    showNameBox,
    setShowNameBox,
    error,
    activeUsers,
    isExistingUser,
    updateUserName,
  } = useHomepage();

  useEffect(() => {
    setShowNameBox(true);
  }, [setShowNameBox]);

  const handleChatAllUsers = () => {
    if (!userName) {
      setShowNameBox(true);
    } else {
      navigate.push('/chat/username');
    }
  };

  const handleDirectMessage = (username: string) => {
    if (!userName) {
      setShowNameBox(true);
    } else {
      navigate.push(`/chat/${username}`);
    }
  };

  return (
    <section className='h-[100dvh] w-full bg-black text-white'>
      <div className="container mx-auto p-4">
        {showNameBox && (
          <div className='p-4 flex flex-col gap-4 items-center'>
            <label htmlFor="username" className='text-lg font-semibold'>
              {isExistingUser ? "Change your username" : "You're required to set your username"}
            </label>
            <div className='flex gap-2'>
  <input
    type="text"
    placeholder="Set your username"
    value={userName}
    onChange={setName}
    className='border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-black'
  />
  <button 
    onClick={async () => {
      if (isExistingUser) {
        await updateUserName(userName);
      } else {
        await nameBoxHandler();
      }
      
      if (!error) {
        setName('');
      }
    }} 
    className='bg-purple-600 px-4 py-2 rounded-lg text-white hover:bg-purple-700'
  >
    {isExistingUser ? 'Change username' : 'Set username'}
  </button>
</div>

            {error && <p className='text-red-500 mt-2'>{error}</p>}
          </div>
        )}
        
        <section className='bg-white mt-20 text-black p-4 rounded-lg'>
          <div className='flex justify-between'>
            <h2 className='text-xl font-semibold mb-4'>Active Users</h2>
            <button 
              onClick={handleChatAllUsers}
              className='bg-purple-600 px-4 py-2 rounded-lg text-white hover:bg-purple-700'
            >
              Chat all users
            </button>
          </div>
          <div className='mt-4'>
            {activeUsers.length > 0 ? (
              activeUsers.map((username: string) => (
                <div key={username} className='flex justify-between items-center p-2 border-b border-gray-300'>
                  <span>{username}</span>
                  <button 
                    onClick={() => handleDirectMessage(username)}
                    className='bg-purple-600 px-3 py-1 rounded-lg text-white hover:bg-purple-700'
                  >
                    Chat
                  </button>
                </div>
              ))
            ) : (
              <p className='text-center font-extrabold text-[28px] p-10'>No active users found.</p>
            )}
          </div>
        </section>
      </div> 
    </section>
  );
};

export default Homepage;
