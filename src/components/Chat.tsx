import { useChat } from "@/context/ChatContext";


const Chat = () => {
  const { messages, input, setInput, sendMessage } = useChat();

  return (
    <div className="p-4">
      <div className="border p-4 h-64 overflow-y-scroll">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div className=" bg-black h-auto p-2">
        <div className="flex mt-4">
          <input
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border flex-grow p-2"
          />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white">
          Send
        </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
