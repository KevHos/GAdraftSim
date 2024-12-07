import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { socket } from './utils/socket';

import Header from './headandfoot/header.js';
import Chat from './socket.chat.js';
import Footer from './headandfoot/footer.js';
import Draft from './draft/draft.js';

function App() {
  const [lobbyName, setLobbyName] = useState('');
  const [playerName, setPlayerName] = useState('');

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
      <Chat currentLobby={lobbyName} currentUser={playerName} />
      <Draft currentLobby={lobbyName} currentUser={playerName} />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
