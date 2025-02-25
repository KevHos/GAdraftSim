
//Methode zum starten des Drafts


module.exports = {
  startDraft,
}

const{io} = require('../server.js')

const {
  DBReadLobby,
  DBReadLobbyPlayers,
} = require('../Database/update/readDatabase.js')

const {
  DBWriteDraftPosition,
} = require('../Database/update/writeDatabase.js')


async function  startDraft(lobbyName, userId) {

  const lobby = (await DBReadLobby(lobbyName))[0];

  const players = await DBReadLobbyPlayers(userId);
  
  //Checken ob die Lobby zusammen mit Bots(Noch nicht integriert) voll ist
  const totalPlayers = await players.length + parseInt(lobby.bots);
  const targetSize = await lobby.max_players;

  console.log("Alle Spieler: " + totalPlayers);
  console.log("Maximale Spieleranzahl: " + targetSize);

  //Countdown für den draft
  if (totalPlayers === targetSize) {

    for (let i = 0; i < players.length; i++) {
      DBWriteDraftPosition(i, players[i].player_id);
    }

    console.log("Lobby " + lobbyName + " is full. Starting draft....");
    let countdown = 5;

    const timer = setInterval(() => {
      io.to(lobbyName).emit("chat_message", `Draft starting in ${countdown} seconds...`);
      countdown--;

      if (countdown < 0) {
        clearInterval(timer);


        //Befehl zum starten des Drafts
        io.to(lobbyName).emit("start_draft");
      }
    }, 1000);
  }

}