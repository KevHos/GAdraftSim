
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


async function  startDraft(lobbyName) {

  console.log("Draft Funktion wird ausgeführt in der Lobby : " + lobbyName);

  const lobby = (await DBReadLobby(lobbyName))[0];

  const players = await DBReadLobbyPlayers(lobbyName);


  //Delay, weil die Datenbank noch nicht aktualisiert ist
  await new Promise(resolve => setTimeout(resolve, 1000));


  //Checken ob die Lobby zusammen mit Bots(Noch nicht integriert) voll ist
  const totalPlayers = players.length + parseInt(lobby.bots);
  const targetSize = lobby.max_players;

  console.log("Alle Spieler: " + totalPlayers);
  console.log("Maximale Spieleranzahl: " + targetSize);

  //Countdown für den draft
  if (totalPlayers === targetSize) {

    for (let i = 0; i < players.length; i++) {
      DBWriteDraftPosition(i, players[i].player_id);

    }

    console.log("Lobby " + lobby.name + " is full. Starting draft....");
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