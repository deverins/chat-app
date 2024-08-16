import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { isErrorMessage } from '@/utils/errorUtils';
import Image from 'next/image';

const Homepage = () => {
  const [userName, setUserName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [showNameBox, setShowNameBox] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [message, setMessage] = useState('');
  const [fetching, setFetching] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const storedUserName = localStorage.getItem('username');
    if (storedUserName) {
      setUserName(storedUserName);
      setIsExistingUser(true);
    } else {
      setIsExistingUser(false);
    }
    setShowNameBox(true);
  }, []);

  const handleChatAllUsers = () => {
    if (!userName) {
      setShowNameBox(true);
    } else {
      router.push('/chat/PUBLIC_ROOM');
    }
  };

  const handleDirectMessage = (username: string) => {
    if (!userName) {
      setShowNameBox(true);
    } else {
      router.push(`/chat/${username}`);
    }
  };

  const setUsername = async () => {
    try {
      if (isExistingUser) {
        // Update the username for an existing user
        await updateUserName(newUserName);
      } else {
        // Set the username for a new user
        const formData = new FormData();
        formData.set("username", userName);
        const response = await axios.post('/api/user', formData, {
          headers: { 'content-type': 'multipart/form-data' },
        });

        if (response.status === 201) {
          setMessage('Username set successfully!');
          localStorage.setItem('username', userName);
        }
      }

      setTimeout(() => {
        setMessage('');
        setUserName('');
        setNewUserName('');
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error setting username');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    }
  };

  const updateUserName = async (newUserName: string) => {
    try {
      const formData = new FormData();
      formData.append('oldUserName', userName);
      formData.append('newUserName', newUserName);

      const response = await axios.put('/api/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setUserName(newUserName);
        setMessage('Username updated successfully!');
        localStorage.setItem('username', newUserName);
        setShowNameBox(true);
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (error: any) {
      setMessage(error.response.data.error || 'Error changing username');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setFetching(true);
        const response = await axios.get('/api/active-user');
        if (response.status === 200) {
          setActiveUsers(response.data.activeUsers.map((user: any) => user.username as string));
        }
      } catch (error: any) {
        setMessage('Failed to fetch active users. Please try again later.');
        setTimeout(() => {
          setMessage('');
        }, 2000);
      } finally {
        setFetching(false);
      }
    };

    fetchActiveUsers();
  }, []);

  return (
    <section className='h-[100dvh] w-full bg-black text-white'>
      <div className="container mx-auto p-4">
        {showNameBox && (
          <div className='p-4 flex flex-col gap-4 items-center'>
            <label htmlFor="username" className='text-lg font-semibold'>
              {isExistingUser ? "Change your username" : "Set your username"}
            </label>
            <div className='flex gap-2'>
              <input
                type="text"
                placeholder={isExistingUser ? "Enter new username" : "Set your username"}
                value={isExistingUser ? newUserName : userName}
                onChange={(e) => isExistingUser ? setNewUserName(e.target.value) : setUserName(e.target.value)}
                className='border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-black'
              />
              <button
                onClick={setUsername}
                className='bg-purple-600 px-4 py-2 rounded-lg text-white hover:bg-purple-700'
              >
                {isExistingUser ? 'Change username' : 'Set username'}
              </button>
            </div>
            {message && <p className={`mt-2 ${isErrorMessage(message) ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
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
            {fetching ?
              (<div className="loader mx-auto ease-linear rounded-full border-4 border-t-4 h-12 w-12" />) :
              <div>
                {activeUsers.length ? (
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
                  <div className='flex justify-center items-center p-2 w-auto h-auto'>
                    <Image
                      src="/use-not-foud1.gif"
                      alt="No active users found"
                      width={500}
                      height={300}
                      priority
                    />
                  </div>
                )}
              </div>
            }
          </div>
        </section>
      </div>
    </section>
  );
};

export default Homepage;
