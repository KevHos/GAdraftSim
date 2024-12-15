//Zusammenbau der Website über die einzelnen Komponenten


import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { socket } from './utils/socket';

import Header from './headandfoot/header.js';
import Chat from './chat/socket.chat.js';
import Footer from './headandfoot/footer.js';
import Draft from './draft/draft.js';

//Hier wird dem Server mitgeteilt, wenn ein User eine Lobby erstellt, beitritt oder verlässt.
//Die tatsächliche Logik dafür ist im Header.js zu finden.


function App() {
  const [lobbyName, setLobbyName] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  //Wenn der Server Lobby Errors sendet, dann wird diese ausgegeben und die Lobby wird zurückgesetzt.
  useEffect(() => {
    socket.on("lobby_error", (message) => {
      alert(message);
      setLobbyName('');
    });
    return () => socket.off("lobby_error");
  }, []);
  

  const handleCreateLobby = (lobbyData) => {

    socket.emit('create_lobby', lobbyData);
    setLobbyName(lobbyData.lobbyName);
    setPlayerName(lobbyData.playerName);
   
  };

  const handleJoinLobby = (lobbyData) => {
    

    socket.emit('join_lobby', lobbyData);
    setLobbyName(lobbyData.lobbyName);
    setPlayerName(lobbyData.playerName);
  
    
    
  };

  const handleLeaveLobby = (lobbyData) => {

    socket.emit('leave_lobby', lobbyData);
    setLobbyName(lobbyData.lobbyName);
    setPlayerName(lobbyData.playerName);
    
  };


//Aufbau der Website
  return (
    <div>
      <Header onCreateLobby={handleCreateLobby} onJoinLobby={handleJoinLobby} onLeaveLobby={handleLeaveLobby} />
      <Chat currentLobby={lobbyName} currentUser={playerName}  />
      <Draft currentLobby={lobbyName}  />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
