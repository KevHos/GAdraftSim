//Datei für die Funktionalität des Chats

import '../styles/chat.css';
import {useEffect, useState} from 'react';
import { socket } from '../utils/socket';

function Chat({ currentLobby, currentUser }) {
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);

  const sendMessage = () => {
  
    if (message.trim() && currentLobby && currentUser) {
      socket.emit("send_message", {
        lobbyName: currentLobby,
        playerName: currentUser,
        message: message
      });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("chat_message", (message) => {
      setMessageHistory((prev) => [...prev, message]);
    });

    socket.on("lobby_error", (error) => {
      alert(error);
    });

    return () => {
      socket.off("chat_message");
      socket.off("lobby_error");
    };
  }, []);

  //HTML code
  return ( 
    <div className="App">
      <h1 className="chat-header">You are in Lobby: {currentLobby}</h1>
      <div className="message-box">
        {messageHistory.map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
      </div>
      <input
        value={message}
        placeholder='Message...'
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <button className='button' onClick={sendMessage} 
              disabled={!currentLobby || !currentUser}>
        Send Message
      </button>
    </div>
  );
}

export default Chat;
