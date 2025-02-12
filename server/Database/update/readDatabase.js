const mysql = require('mysql');

module.exports = {
    DBReadUser,
    DBReadLobby,
    DBReadLobbyPlayers,
    DBReadAllLobbys,
    DBReadDeck,
    DBReadCard,
    DBReadNextPlayer,
    DBReadBooster,
    DBReadBoosterCards,
    DBReadAllUsers,
}

const { query } = require('./mysqlConnection.js');


async function DBReadUser(userId) 
{
    return await query("SELECT * FROM players WHERE player_id = ?", [userId]);
}


async function DBReadAllUsers()
{ 
    return await query("SELECT * FROM players")  
}


async function DBReadNextPlayer(lobbyId, nextPosition) 
{
   return await query("SELECT * FROM players WHERE lobby_id = ? AND CAST(draft_position AS SIGNED) = ?", 
    [lobbyId, nextPosition], )
}

async function DBReadDeck(userId) 
{
   return await query("SELECT * FROM decks WHERE player_id = ?",[userId])
}

async function DBReadAllLobbys() 
{
    return await query("SELECT * FROM lobbys")
}

async function DBReadLobby(lobbyId) 
{
    return await query("SELECT * FROM lobbys WHERE lobby_id = ?", [lobbyId]);
}

async function DBReadLobbyPlayers(lobbyId) 
{
    return await query("SELECT * FROM players WHERE lobby_id = ?", [lobbyId]);
}

async function DBReadBooster(playerId) 
{
    return await query("SELECT * FROM boosters WHERE player_id = ?", [playerId]);
}

async function DBReadBoosterCards(boosterId) {

    return await query("SELECT * FROM cards WHERE booster_id = ?", [boosterId]);
}

async function DBReadCard(cardId) 
{
    return await query("SELECT * FROM cards WHERE card_id = ?", [cardId]);
}
