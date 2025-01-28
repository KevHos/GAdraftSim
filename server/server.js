const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');



//Erlaubt Cors in der gesamtem Expresss App
app.use(cors())
//Helmet fügt Sicherheitsfeatures hinzu
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//Setzt Website/public als root Folder für den Client
app.use(express.static('Website/public'));

//Routes für den Draft
const draftRouter = express.Router();
app.use('/api/draft', draftRouter)


//SocketIO
const httpServer = require("http").createServer(app);

//Cors für SocketIO Frontend in React, die komplett unabhängig vom Express Cors ist
const options = {
  cors: {
    origin: "http://localhost:3000/",
    methods: ["GET", "POST"],
    credentials: true
  }
};
const io = require("socket.io")(httpServer, options);

//Map aller aktiven Lobbys
const activeLobbies = new Map();

//Methoden für das schreiben und auslesen der Datenbank
const { DBCreateUser,
  DBWriteConnectFalse,
  DBWriteConnectTrue,
  DBCreateLobby,
  DBDeleteLobby,
  DBWriteDraftPosition,
  DBJoinUser,
  DBLeaveUser,
  DBCreateBooster,
  DBDeleteBooster,
  DBUpdateCard,
  DBUpdateBoosterOwner,
  DBUpdateUserState,
  DBNextRound,

} = require('./Database/update/writeDatabase.js');

const {
  DBReadUser,
  DBReadLobby,
  DBReadAllLobbys,
  // DBReadDeck,
  DBReadLobbyPlayers,
  DBReadBooster,
  DBReadBoosterCards,

} = require('./Database/update/readDatabase.js')



//Alle 10 Sekunden werden leere Lobbys gelöscht
setInterval(async () => {



  let lobbys = await DBReadAllLobbys()

  console.log("Checking for empty lobbys");


  for (let i = 0; i < lobbys.length; i++) {

    players = await DBReadLobbyPlayers(lobbys[i].lobby_id);

    if (players.length == 0) {
      //await DBDeleteLobby(lobbys[i].lobby_id);
      await DBDeleteLobby(lobbys[i].lobby_id);
      console.log("Lobby " + lobbys[i].lobby_id + " deleted");
    }
    else {
      console.log("No empty Lobbys");
    }
  }

}, 90000);



io.on("connection", (socket) => {

  console.log("User connected:", socket.id);
  DBCreateUser(socket.id);



  socket.on("create_lobby", async (data) => {
    const { lobbyName, playerName, playerID, edition, gameMode, lobbySize, bots, boosters, timer } = data;


    //Prüfen ob Lobby schon existiert, wenn nicht, wird eine neue erstellt
    const Lobby = (await DBReadLobby(lobbyName))[0];
    if (Lobby == undefined) {

      await DBCreateLobby(lobbyName, playerID, lobbySize, edition, gameMode, bots, boosters, timer);
      await DBJoinUser(playerID, lobbyName, playerName);
      console.log("Name der Lobby: " + lobbyName);
      console.log("Timestamp lobby creation:", new Date().toISOString());
      socket.join(lobbyName);
      //Senden der Chatmessage, dass der Spieler die Lobby erstellt hat
      io.to(lobbyName).emit("chat_message", `${playerName} created the lobby ${lobbyName}`);
    }
    else {
      io.to(playerID).emit("lobby_error", "Lobby already exists");

    }
  });



  socket.on("join_lobby", async (data) => {


    const { lobbyName, playerName, playerID } = data;

    const lobby = (await DBReadLobby(lobbyName))[0];
    let players = await DBReadLobbyPlayers(lobbyName);

    if (lobby == undefined) {
      io.to(playerID).emit("lobby_error", "Lobby does not exist");
    }
    else if (lobby.max_players === players.length) {
      io.to(playerID).emit("lobby_error", "Lobby is full");
    }
    else {
      await DBJoinUser(playerID, lobbyName, playerName);

      //Delay, weil die Datenbank noch nicht aktualisiert ist
      await new Promise(resolve => setTimeout(resolve, 1000));

      socket.join(lobbyName);
      io.to(lobbyName).emit("chat_message", `${playerName} joined the lobby  ${lobbyName}`);

      players = await DBReadLobbyPlayers(lobbyName);


      //Checken ob die Lobby zusammen mit Bots(Noch nicht integriert) voll ist
      const totalPlayers = players.length + parseInt(lobby.bots);
      const targetSize = lobby.max_players;

      console.log("Anzahl der Spieler in Lobby " + lobby.lobby_id + " sind " + players.length);
      console.log("Gebrauchte Anzahl ist : " + targetSize);


      //Countdown für den draft
      if (totalPlayers === targetSize) {

        for (let i = 0; i < players.length; i++) {
          DBWriteDraftPosition(i, players[i].player_id);
          console.log(i);
        }

        console.log("Lobby " + lobby.name + " is full. Starting draft in....");
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

  });

  //Der Befehl um in eine Lobby mit dem zugehörigen Playernamen eine Nachricht zu verschicken
  socket.on("send_message", (data) => {
    const { lobbyName, playerName, message } = data;

    io.to(lobbyName).emit("chat_message", `${playerName}: ${message}`);

  });

  socket.on("leave_lobby", async (data) => {
    const disconnectedPlayer = socket.id;
    const playerName = data.playerName;

    const lobbyName = (await DBReadLobby(disconnectedPlayer))[0];
    console.log(lobbyName);


    await DBLeaveUser(socket.id);

    io.to(lobbyName.lobby_id).emit("chat_message", `${playerName} left the lobby ${lobbyName.lobby_id}`);

  });


  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    const disconnectedPlayer = socket.id;

    const lobbyName = await DBReadLobby((disconnectedPlayer))[0];

    await DBLeaveUser(socket.id);

    io.to(lobbyName).emit("chat_message", `${disconnectedPlayer} disconnected`);

    await DBWriteConnectFalse(socket.id);
  });


  const { generateBooster } = require('./createBooster.js');

  //Websocket hört auf die Anfrage "generateBooster" und bekommt mit der Anfrage die ID des Users
  socket.on("generateBooster", async (data) => {
    try {
      const playerId = data.currentUser;

      console.log(playerId);

      console.log("Der Spieler mit der ID " + playerId + " hat den Befehl generateBooster ausgeführt");

      //User aus der DB abfragen
      const resultUser = (await DBReadUser(playerId))[0];

      //console.log("User Object: ", resultUser);


      //Lobby aus der DB abfragen
      const resultLobby = (await DBReadLobby(resultUser.lobby_id))[0];

      //console.log("Lobby Object: " , resultLobby);

      //Methode zum Booster generieren
      const booster = await generateBooster(resultUser.player_id, resultLobby.edition_id, resultLobby.gamemode);

      //Booster in der DB speichern
      await DBCreateBooster(booster)


      console.log("Generated booster for player " + playerId, ":", booster.cards.length, "cards");


      ///Booster an den Client senden
      io.to(playerId).emit("booster_generated", booster);



    } catch (error) {
      console.error("Error generating booster:", error);
      socket.emit("booster_generation_error", "Failed to generate booster");
    }
  });

  ///Draft Pick enthält die Logik für die Weitergabe der Booster
  socket.on("draft_pick", async (data) => {
    const { user_id, booster_id, card_id } = data;

    //Der Karte einen neuen User geben
    await DBUpdateCard(user_id, card_id);
    //User auf "picked" setzen
    await DBUpdateUserState(user_id, "picked");



    //Delay um die Datenbank zu aktualisieren
    await new Promise(resolve => setTimeout(resolve, 100));

    //Read User
    const player = (await DBReadUser(user_id))[0];
    //Read Lobby
    const lobby = (await DBReadLobby(player.lobby_id))[0];

    //Alle Spieler der Lobby auslesen
    const players = await DBReadLobbyPlayers(lobby.lobby_id);

    //Feststellen ob alle Spieler gepickt haben
    let allPlayersPicked = true;

    for (let i = 0; i < players.length; i++) {
      let pick = await DBReadUser(players[i].player_id);

      if (pick[0].draft_state === "not_picked") {
        allPlayersPicked = false;
        break;
      }
    }

    console.log("All players picked: ", allPlayersPicked);


    //Wenn alle Spieler gepickt haben, Booster zwischen Spielern tauschen und zusenden
    if (allPlayersPicked == true) {


      //Alle Spieler auf "not_picked" setzen
      for (let i = 0; i < players.length; i++) {
        await DBUpdateUserState(players[i].player_id, "not_picked");
        allPlayersPicked = false;
      }


      //Booster umschreiben
      await DBUpdateBoosterOwner(lobby.lobby_id);


      //Spielern die neuen Booster senden oder ein neues generieren, falls die Booster leer sind
      for (let i = 0; i < players.length; i++) {
        booster = await DBReadBooster(players[i].player_id);
        booster[0].cards = await DBReadBoosterCards(booster[0].booster_id);

        //Wenn das Booster leer ist, die Lobby um eine Runde hoch setzen, Booster löschen und neuen generieren
        if (booster[0].cards.length === 0) {

          await DBDeleteBooster(booster[0].booster_id);

          if (lobby.round_number == lobby.boosters) {
            socket.emit("end_draft", lobby.lobby_id);
          }
          else {
            await DBNextRound(lobby.lobby_id);
            io.to(players[i].player_id).emit("start_draft", booster[0]);
          }


        }

        //Booster an die Spieler senden
        io.to(players[i].player_id).emit("next_booster", booster[0]);
      }
    }

  });



});










//Beispiele aus einem Tutorial für das zukünftige Routing

const { get } = require('http');
//const { setInterval } = require('timers');

app.get("/", (req, res) => {

  res.sendFile(path.join(__dirname, '/../Website/index.html'));
});

//Routing Variabel halten für verschiedene Lobbys
app.get("/:games/:lobby/", (req, res) => {

  res.send(`<h1>Das ist die Lobby "${req.params.lobby}" in der  ${req.params.games} gespielt wird </h1>`);
  console.log("games: " + req.params.games);
  console.log("lobby: " + req.params.lobby);


});


app.get("/:games/:lobby/pick", (req, res) => {

  res.send(`<h1>Das ist die Lobby "${req.params.lobby}" in der  ${req.params.games} gespielt wird und es wurde Karte ...... gepickt </h1>`);


});

app.get("/users/", (req, res) => {

  console.log("users " + res.locals.validatedUsers);

  res.send("<h1>Hallo Get User</h1>");
});

//Post befehle
app.post("/", (req, res) => {


  res.json({ authenticated: true });
});

//Update
app.put("/*", (req, res) => {


  res.send("<h1>Hallo Update</h1>");
});

//Delete
app.delete("/*", (req, res) => {


  res.send("<h1>Hallo Delete</h1>");
});



//Port des Servers
const PORT = 3500;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
