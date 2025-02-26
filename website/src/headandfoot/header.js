//Im Header werden die eingegeben daten des Users für die Lobby ausgelesen und über das Index-File an den Server geschickt.

import "../styles/header.css"
import React, { useState } from 'react';
import { socket } from '../utils/socket';

function Header({ onJoinLobby, onLeaveLobby, onCreateLobby }) {
    const [lobbyName, setLobbyName] = useState('');
    const [playerName, setPlayerName] = useState('');


    const createLobbyData = () => ({
        lobbyName,
        playerName,
        playerID: socket.id,
        edition: document.getElementById('editions').value,
        gameMode: document.getElementById('game-mode').value,
        lobbySize: document.getElementById('lobbysize').value,
        bots: document.getElementById('bots').value,
        boosters: document.getElementById('boosters').value,
        timer: document.getElementById('time').value
    });




    const handleCreate = (e) => {
        e.preventDefault();

        const lobbyData = createLobbyData();
        onCreateLobby(lobbyData);
        

    };


    const handleJoin = (e) => {
        e.preventDefault();

        const lobbyData = createLobbyData();
        
        onJoinLobby(lobbyData);
    };



    return (
        <header class="site-header">
            <div class="header-content">
                <div class="field">
                    <label for="username">Username:</label>
                    <input type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Player Name" />
                </div>
                <div class="field">
                    <label for="session-id">Session ID:</label>
                    <input type="text"
                        value={lobbyName}
                        onChange={(e) => setLobbyName(e.target.value)}
                        placeholder="Lobby Name" />
                </div>
                <div class="field">
                    <label for="editions">Edition:</label>
                    <select id="editions">
                        <option value="doaalter">Dawn of Ashes</option>
                        <option value="ftc">Fractured Crown</option>
                        <option value="alc">Alchemical Revolution</option>
                        <option value="mrc">Mercurial Heart</option>
                        <option value="amb">Mortal Ambition</option>
                    </select>
                </div>
                <div class="field">
                    <label for="game-mode">Game Mode:</label>
                    <select id="game-mode">
                        <option value="draft">Draft</option>
                        <option value="draft+">Draft(+Rares)</option>
                        <option value="draft+m">Draft(MoreCards)</option>
                    </select>
                </div>
                <div class="field">
                    <label for="lobbysize">LobbySize:</label>
                    <select id="lobbysize">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>
                <div class="field">
                    <label for="bots">Bots:</label>
                    <select id="bots">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </select>
                </div>
                <div class="field">
                    <label for="boosters">Boosters:</label>
                    <select id="boosters">
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>
                <div class="field">
                    <label for="time">Timer Seconds</label>
                    <select id="time">
                        <option value="60">60</option>
                        <option value="90">90</option>
                        <option value="120">120</option>
                        <option value="150">150</option>
                        <option value="260">260</option>
                    </select>
                </div>
                <button className="lobby_button" onClick={handleCreate}>Create Lobby</button>
                <button className="lobby_button" onClick={handleJoin}>Join Lobby</button>
            </div>
        </header>

    );
}

export default Header;



