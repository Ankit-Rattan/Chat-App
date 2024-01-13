// App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
  },
});

function App() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    // Attach event listener only once when component mounts
    socket.on('chat message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('chat history', (history) => {
      setMessages(history);
    });

    // Cleanup the socket listener when the component unmounts
    return () => {
      socket.off('chat message');
      socket.off('chat history');
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const sendMessage = () => {
    socket.emit('chat message', { user, message: messageInput });

    setMessages((prevMessages) => [...prevMessages, { user, message: messageInput }]);
    setMessageInput('');
  };

  return (
    <>
    <div className='main'>
    <h1 className='heading'>👨‍💻Thought Box⌨️</h1>
  <div>
  </div>
      <div className='message'>
        {messages.map((message, index) => (
          <div key={index} className='messbox'>
            <div className='messboxin'>{message.message}</div>
            <p className='messauth'><strong>~</strong> {message.user}</p> 
          </div>
        ))}
      </div>
      <div className='button'>

      <input
        type="text"
        placeholder="Your Name 🙎"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        type="text"
        placeholder="Type your message... 📝"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      </div>
    </div>
    </>
  );
}

export default App;
