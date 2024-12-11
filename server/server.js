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


//Alle 30 Sekunden werden leere Lobbys gelöscht
setInterval(() => {

  console.log(activeLobbies);
  
  
  for (const [lobbyName, lobby] of activeLobbies.entries()) {
    if (lobby.players.length === 0) {
      DBDeleteLobby(lobbyName);
      activeLobbies.delete(lobbyName);
    }
  }

}, 30000);


const { DBCreateUser, DBWriteConnectFalse, DBWriteConnectTrue, DBCreateLobby, DBDeleteLobby } = require('./Database/write/writeDatabase.js');

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  

  DBCreateUser(socket.id);


  socket.on("create_lobby", (data) => {
    const { lobbyName, playerName, playerID, edition, gameMode, lobbySize, bots, boosters, timer} = data;
    console.log("Timestamp lobby creation:", new Date().toISOString());
    DBCreateLobby(lobbyName, playerID, lobbySize, edition, gameMode, bots, boosters, timer);

    if (activeLobbies.has(lobbyName)) {
      socket.emit("lobby_error", "Lobby already exists");
      return;
    }
    //Eine Lobby hat diverse Daten, die in der Lobby gespeichert werden um den Gamestate zu überprüfen

    const lobbyData = {
      name: lobbyName,
      host: playerName,
      host_id: playerID,
      edition,
      gameMode,
      lobbySize,
      bots,
      boosters,
      timer,
      players: []
    };
 
    //Die beiden Maps befüllen sich mit den Daten
    
    activeLobbies.set(lobbyName, lobbyData);

    io.to(lobbyName).emit("lobby_created", lobbyData);
    io.to(lobbyName).emit("chat_message", `${playerName} created the lobby ${lobbyName}`);
  });

  socket.on("join_lobby", (data) => {
    console.log(data);
    
    const { lobbyName, playerName, playerID } = data;

    if (!activeLobbies.has(lobbyName)) {
      socket.emit("lobby_error", "This lobby doesn't exist");
      return;
    }
  

    const lobby = activeLobbies.get(lobbyName);
    const maxLobbySize = lobby.lobbysize;


    //Checken ob die Lobby voll ist. Hier gibt es noch bugs. Die Lobby wird zwar als voll angezeigt, aber der Spieler kann trotzdem noch beitreten.
    if (lobby.players.length >= maxLobbySize) {
      socket.emit("lobby_error", "Lobby is full");
      return;
    }

    
    lobby.players.push(playerID);
    socket.join(lobbyName);
    io.to(lobbyName).emit("chat_message", `${playerName} joined the lobby  ${lobbyName}`);

    //Checken ob die Lobby zusammen mit Bots(Noch nicht integriert) voll ist
    const totalPlayers = lobby.players.length + parseInt(lobby.bots);
    const targetSize = lobby.lobbySize;
    console.log("Anzahl Spieler: " +totalPlayers+ " Größe der Lobby: " + targetSize);
    
    //Countdown für den draft
    if (totalPlayers == targetSize) {
      console.log("Lobby is full. Starting draft in....");
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

  });


//Der Befehl um in eine Lobby mit dem zugehörigen Playernamen eine Nachricht zu verschicken
  socket.on("send_message", (data) => {
    const { lobbyName, playerName, message } = data;
    if (activeLobbies.has(lobbyName)) {
      io.to(lobbyName).emit("chat_message", `${playerName}: ${message}`);
    }
  });


  //Leave und Disconnect sind derzeit noch identisch, können aber gegebenenfalls angepasst werden

  socket.on("leave_lobby", (data) => {
    const disconnectedPlayer = socket.id;
    const playerName = data.playerName;

    for (const [lobbyName, lobby] of activeLobbies.entries()) {
      if (lobby.players.includes(disconnectedPlayer)) {
        lobby.players = lobby.players.filter(player => player !== disconnectedPlayer);
        activeLobbies.set(lobbyName, lobby);
        io.to(lobbyName).emit("chat_message", `${playerName} left the lobby ${lobbyName}`);
      }
    }
    
  });


//um den Spielernamen anzuzeigen, kann ich zukünftig die Datenbank abfragen

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const disconnectedPlayer = socket.id;
    

    for (const [lobbyName, lobby] of activeLobbies.entries()) {
      if (lobby.players.includes(disconnectedPlayer)) {
        lobby.players = lobby.players.filter(player => player !== disconnectedPlayer);
        activeLobbies.set(lobbyName, lobby);
        io.to(lobbyName).emit("chat_message", `${disconnectedPlayer} disconnected`);
      }
    }
    DBWriteConnectFalse(socket.id);
    
    
  });


});







//Importierung der Methode der Booster Erstellung
const { generateBooster } = require('./createBooster.js');
const { get } = require('http');


//Über die Anfrage wird ein Booster generiert
draftRouter.get('/booster', async (req, res) => {
  const playerName = req.query.currentUser;
  const lobbyName = req.query.currentLobby;
  const lobby = activeLobbies.get(lobbyName);
 
  
  
  const booster = await generateBooster(
    playerName,
    lobby.edition,
    lobby.gameMode,
  );
  res.json({ booster: booster });
  console.log("Print Inhalt des Boosters: ");
  console.log(JSON.stringify(booster));
});


// Datenbank Einbindung fehlt auch hier noch komplett aber zumindest, kann ich ausgewählte Karten tracken.
draftRouter.post('/pick', (req, res) => {

  const { user_id, booster_id, card_id } = req.body;

  console.log(req.body);
  res.json({ success: true });
});







//Beispiele aus einem Tutorial für das zukünftige Routing



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
