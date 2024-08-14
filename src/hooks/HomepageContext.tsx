import React, { createContext, useContext, useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios';

interface HomepageContextProps {
  userName: string;
  showNameBox: boolean;
  error: string;
  fetching: boolean,
  activeUsers: string[];
  isExistingUser: boolean;
  setUserName: (userName: string) => void;
  setActiveUsers: (users: string[]) =>void;
  setShowNameBox: (showNameBox: boolean) => void;
  setError: (error: string) => void;
  nameBoxHandler: () => void;
  setName: (input: string | ChangeEvent<HTMLInputElement>) => void;
  setIsExistingUser: (exists: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  updateUserName: (newUserName: string) => Promise<void>;
}

const HomepageContext = createContext<HomepageContextProps | undefined>(undefined);

export const useHomepage = () => {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error('useHomepage must be used within a HomepageProvider');
  }
  return context;
};

export const HomepageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [userName, setUserName] = useState<string>(localStorage.getItem('username') || '');
  const [showNameBox, setShowNameBox] = useState(!userName);
  const [error, setError] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [fetching, setFetching] = useState(true);

  const setName = (input: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof input === 'string') {
      setUserName(input);
    } else {
      setUserName(input.target.value);
    }
  };

  async function nameBoxHandler() {
    try {
        const response = await axios.post('/api/user', { username: userName });
        if (response.status === 201) {
            setUserName(response.data.user.username);
        setIsExistingUser(true);
        setError('');
        localStorage.setItem('username', response.data.user.username);
        setShowNameBox(false);  
            setError('');
        }
    } catch (error) {
        setError('Error processing username');
    }

    try {
        const checkResponse = await axios.get('/api/user', {
            params: { username: userName },
        });
        if (checkResponse.status === 200) {
            setError('Username already exists. Please choose another.');
        }
    } catch (error) {
        console.error('Error checking existing username:', error);
    }
}



  const updateUserName = async (newUserName: string) => {
    try {
      const response = await axios.put('/api/user', { oldUserName: userName, newUserName });

      if (response.status === 200) {
        setUserName(newUserName);
        setError('');
        localStorage.setItem('username', newUserName);
      }
    } catch (error) {
      setError('Error changing username');
    }
  };

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setFetching(true)
        const response = await axios.get('/api/active-user');
        if (response.status !== 200) return;
        setActiveUsers(response.data.activeUsers.map((user: any) => user.username as string));
      } catch (error: any) {
        console.error('Error fetching active users:', error);
        setError('Failed to fetch active users. Please try again later.');
      } finally {
        setFetching(false)
      }
    };

    fetchActiveUsers();
  }, []);



  return (
    <HomepageContext.Provider
      value={{
        userName,
        showNameBox,
        error,
        activeUsers,
        setActiveUsers,
        isExistingUser,
        setUserName,
        setShowNameBox,
        setError,
        nameBoxHandler,
        setName,
        setIsExistingUser,
        inputRef,
        updateUserName,
        fetching,
      }}
    >
      {children}
    </HomepageContext.Provider>
  );
};