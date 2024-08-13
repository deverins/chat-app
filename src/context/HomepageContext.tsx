import React, { createContext, useContext, useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios';

interface HomepageContextProps {
  userName: string;
  showNameBox: boolean;
  error: string;
  activeUsers: string[];
  isExistingUser: boolean;
  setUserName: (userName: string) => void;
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

  const setName = (input: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof input === 'string') {
      setUserName(input);
    } else {
      setUserName(input.target.value);
    }
  };

  const nameBoxHandler = async () => {
    try {
      // Check if the user exists
      const checkResponse = await axios.get('/api/user', {
        params: { username: userName },
      });

      if (checkResponse.status === 200) {
        setError('Username already exists. Please choose another.');
        return;
      }

      // If the username doesn't exist, create a new one
      const response = await axios.post('/api/user', { userName });
      if (response.status === 201) {
        setShowNameBox(false);
        setUserName(response.data.user.username);
        setIsExistingUser(true);
        setError('');
        localStorage.setItem('username', response.data.user.username);
      }
    } catch (error) {
      console.error('Error in nameBoxHandler:', error);
      setError('Error processing username');
    }
  };


  const updateUserName = async (newUserName: string) => {
    try {
      const response = await axios.put('/api/user', { oldUserName: userName, newUserName });

      if (response.status === 200) {
        setUserName(newUserName);
        setError('');
        localStorage.setItem('username', newUserName);
      }
    } catch (error) {
      console.error('Error changing username:', error);
      setError('Error changing username');
    }
  };


  return (
    <HomepageContext.Provider
      value={{
        userName,
        showNameBox,
        error,
        activeUsers,
        isExistingUser,
        setUserName,
        setShowNameBox,
        setError,
        nameBoxHandler,
        setName,
        setIsExistingUser,
        inputRef,
        updateUserName,
      }}
    >
      {children}
    </HomepageContext.Provider>
  );
};











// import React, { createContext, useContext, useState, useRef, useEffect, ChangeEvent } from 'react';
// import axios from 'axios';

// interface HomepageContextProps {
//   userName: string;
//   showNameBox: boolean;
//   error: string;
//   activeUsers: string[];
//   isExistingUser: boolean;  // New state
//   setUserName: (userName: string) => void;
//   setShowNameBox: (showNameBox: boolean) => void;
//   setError: (error: string) => void;
//   nameBoxHandler: () => void;
//   handleChatAllUsers: () => void;  // Function to handle chatting with all users
//   handleDirectMessage: (username: string) => void;  // Function to handle direct messaging
//   setName: (input: string | ChangeEvent<HTMLInputElement>) => void;
//   checkUserName: () => void;  // New function to check username
//   setIsExistingUser: (exists: boolean) => void;  // Function to set new state
//   inputRef: React.RefObject<HTMLInputElement>;
// }

// const HomepageContext = createContext<HomepageContextProps | undefined>(undefined);

// export const useHomepage = () => {
//   const context = useContext(HomepageContext);
//   if (!context) {
//     throw new Error('useHomepage must be used within a HomepageProvider');
//   }
//   return context;
// };

// export const HomepageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [userName, setUserName] = useState<string>(localStorage.getItem('username') || '');
//   const [showNameBox, setShowNameBox] = useState(!userName);
//   const [error, setError] = useState<string>('');
//   const [activeUsers, setActiveUsers] = useState<string[]>([]);
//   const [isExistingUser, setIsExistingUser] = useState(false);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => {
//         setError('');
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [error]);

//   const setName = (input: string | ChangeEvent<HTMLInputElement>) => {
//     if (typeof input === 'string') {
//       setUserName(input);
//     } else {
//       setUserName(input.target.value);
//     }
//   };

//   const checkUserName = async () => {
//     try {
//       const response = await axios.get('/api/user', { params: { username:userName } });
//       if (response.data.user) {
//         setIsExistingUser(true);
//       } else {
//         setIsExistingUser(false);
//       }
//     } catch (error) {
//       setError('Error checking username');
//     }
//   };

//   const nameBoxHandler = async () => {
//     try {
//       let response;

//       if (isExistingUser) {
//         response = await axios.put('/api/user', {
//           oldUserName: userName,
//           newUserName: userName,
//         });
//       } else {
//         response = await axios.post('/api/user', {username: userName });
//       }

//       if (response.data.success) {
//         setShowNameBox(false);
//         setIsExistingUser(true);
//         setUserName(response.data.user.username); // Update the username state
//         setError('');
//         // Optionally, you can fetch the active users again
//         fetchActiveUsers();
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       setError('Error saving username');
//     }
//   };

//   const fetchActiveUsers = async () => {
//     try {
//       const response = await axios.get('/api/activeUsers');
//       setActiveUsers(response.data.users);
//     } catch (error) {
//       setError('Error fetching active users');
//     }
//   };

//   const handleChatAllUsers = () => {
//     // Logic for initiating a chat with all users
//     console.log("Chatting with all users");
//   };

//   const handleDirectMessage = (username: string) => {
//     // Logic for initiating a direct message with a specific user
//     console.log(`Chatting directly with ${username}`);
//   };

//   return (
//     <HomepageContext.Provider
//       value={{
//         userName,
//         showNameBox,
//         error,
//         activeUsers,
//         isExistingUser,
//         setUserName,
//         setShowNameBox,
//         setError,
//         nameBoxHandler,
//         handleChatAllUsers,
//         handleDirectMessage,
//         setName,
//         checkUserName,
//         setIsExistingUser,
//         inputRef
//       }}
//     >
//       {children}
//     </HomepageContext.Provider>
//   );
// };
