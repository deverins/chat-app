import Chat from '@/components/Chat';
import { ChatProvider } from '@/context/ChatContext';
import React from 'react';

function Home() {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
}

export default Home;

// "use client";
// import { useState, useEffect, ChangeEvent, useRef, useMemo } from 'react';
// import { io, Socket } from 'socket.io-client';

// let socket: Socket;

//  function Home() {
//    const inputRef = useRef<HTMLInputElement|null>(null)
//   const [message, setMessage] = useState<string>('');
//   const [messages, setMessages] = useState<string[]>([]);
//   const [userName, setUserName] = useState("");
//   const [chatName, setChatName] = useState("");
//   const [roomName, setRoomName] = useState("");
//   const [showNameBox, setShowNameBox] = useState(false)
  

//   useEffect(() => {
//     socket = io();

//     socket.on('connect', () => {
//       console.log('Connected to server');
//     });

//     socket.on("roomName", (name: string) =>{
//       console.log({roomName: name});
      
//       setRoomName(name)
//     })

//     socket.on("error", function(err){
//       console.log(err);
//     }
//     )

//     if (chatName) {
//       socket.emit("userName", chatName)
//     }

//     if(roomName && roomName.includes(chatName)){
//       console.log(roomName, chatName, " rooom and chat");
      
//       socket.on(roomName, (message: string) => {
//         setMessages((prevMessages) => [...prevMessages, message]);
//       });
//     }

//     return () => {
//       socket.disconnect();
//     };
//   }, [chatName, roomName]);

//   const sendMessage = () => {
//     if (message && roomName && chatName  && roomName.includes(chatName)) {
//       socket.emit(roomName, message);
//       if(inputRef?.current){
//         inputRef.current.value  = ""
//       }

//       setMessage('');


//     }

//   };

//   const setText=(event: ChangeEvent<HTMLInputElement>)=>{
//     setMessage( event.target.value)
//   }

//   const setName=(event: ChangeEvent<HTMLInputElement>)=>{
//     setUserName( event.target.value)
//   }

//   const nameBoxHandler=()=>{
//     if(!showNameBox){
//       setShowNameBox(true)
//     }else {
//       setChatName(userName)
//     }
//   }


//   return(
//     <section className='h-[100dvh] w-full bg-black text-white relative'>
//       <div className='h-[calc(100dvh-80px)] overflow-y-auto p-2'>
//           {messages.map((m, index)=>(
//             <div key={index} className='mb-2 p-2 border-b rounded-lg bg-neutral-700'>
//               {m}
//             </div>
//           ))}
//       </div>
//       <div className='h-20 px-3 gap-3 flex items-center'>
//         <input ref={inputRef} type="text" onChange={setText} className='w-full'  />
//         <button  className='bg-purple-600 px-3 py-2 rounded-lg' onClick={sendMessage}>Send</button>
//       </div>

//       <div className='absolute p-2 flex gap-2 top-0 right-0'>
//         { showNameBox && 
//           <input type="text" onChange={setName} className='w-40' />
//         }

//         <button onClick={nameBoxHandler} className='bg-purple-600 px-3 py-2 rounded-lg'>
//           {showNameBox? 'Set name':' Client to enter name' }</button>

//       </div>
//     </section>
//   )


// }

// export default Home;
