//Funktionen um die Datenbank zu befüllen, noch nicht fertig.
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');

const { DBReadUser, DBReadLobby, DBReadDeck, } = require('./readDatabase.js')

module.exports = {
    DBCreateUser,
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
    

}

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stateOfTheGame",
  
  });
//Tables Players    
async function DBCreateUser(userId)
{

    con.query(
        "INSERT INTO players (player_id, connected, is_Bot) VALUES ('" + userId + "', TRUE, FALSE)",
        function (err, result) {
          if (err) throw err;
        }
      );

      const deckId = uuidv4();

      con.query(
        "INSERT INTO decks (deck_id, player_id) VALUES ('" + deckId + "', '" + userId + "')",
        function (err, result) {
          if (err);
        }
      );
    }

  async function DBJoinUser(userId, lobbyId, playerName)
  {
    con.query(
        "UPDATE players SET lobby_id = '" + lobbyId + "', name = '" + playerName + "' WHERE player_id = '" + userId + "'",
        function (err, result) {
          if (err) throw err;
        }
      );
    }

    async function DBLeaveUser(userId)
    {
      con.query(
        "UPDATE players SET lobby_id = NULL WHERE player_id = '" + userId + "'",
        function (err, result) {
          if (err) throw err;
        }
      );
    }
    
async function DBWriteConnectFalse(userId)
{
    con.query(
        "UPDATE players SET connected = FALSE WHERE player_id = '" + userId + "'",
        function (err, result) {
          if (err) throw err;
        })
    }

    async function DBWriteConnectTrue(userId)
    {
        con.query(
            "UPDATE players SET connected = True WHERE player_id = '" + userId + "'",
            function (err, result) {
              if (err) throw err;
            })
        }

    async function DBWriteDraftPosition(position, userId)
    {
      con.query(
        "UPDATE players SET draft_position = '"+position+"' WHERE player_id = '" + userId + "'",
        function (err, result) {
          if (err) throw err;
        })
    }
    
    

    //Table Lobbys
    
    async function DBCreateLobby(lobbyName, playerName, lobbySize, edition, gameMode, bots, boosters, timer) 
    {
    var sqlInsert = `INSERT INTO lobbys (lobby_id, state, created_at, host_name, max_players, edition_id, gamemode, bots, time, round_number, boosters)
    VALUES (?, 'open', NOW(), ?,?,?,?,?,?, 0, ?)`;
    var values = [lobbyName, playerName, lobbySize, edition, gameMode, bots, timer, boosters];
    con.query(sqlInsert,values, function (err, result) {
        if (err) throw err;
        }
      ); 
    }

    async function DBDeleteLobby(lobbyName)
    {
      con.query(
            "DELETE FROM lobbys WHERE lobby_id = '" + lobbyName + "'",
            function (err, result) {
              if (err) throw err;
            })
    }

  //Table Booster und Cards

  async function DBCreateBooster(booster)
  {
    
   var boosterId = booster.booster_id;
   var playerId = booster.owner;
   var state = booster.state;
   var editionId = booster.edition;

   console.log("Booster ID: " + boosterId);
   console.log("Player ID: " + playerId);
   console.log("State: " + state);
   console.log("Edition ID: " + editionId);
  
   


    con.query(
      "INSERT INTO boosters (booster_id, player_id, state, edition_id) VALUES ('" + boosterId + "', '" + playerId + "', '" + state + "', '" + editionId + "')",
      function (err, result) {
        if (err) throw err;
      }
    );

    for (let i = 0; i < booster.cards.length; i++) {
  
      var card_id = booster.cards[i].card_id;
      var uu_id = booster.cards[i].uu_id;
      var name = booster.cards[i].name;
      var memory = booster.cards[i].memory;
      var reserve = booster.cards[i].reserve;
      var element = booster.cards[i].element;
      var rarity = booster.cards[i].rarity;
      var slug_edition = booster.cards[i].slug_edition;
      var picture = booster.cards[i].picture;
      var deck_id = "NULL";
      var booster_id = booster.booster_id;
  
      con.query(
        "INSERT INTO cards (card_id, uu_id, name, memory, reserve, element, rarity, slug_edition, picture, deck_id, booster_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)",
        [card_id, uu_id, name, memory, reserve, element, rarity, slug_edition, picture, booster_id],
        function (err, result) {
            if (err) throw err;
        }
    );
    
        }
      }
    

    
    
    async function DBDeleteBooster(boosterId) {

      // Möglicherweise irrelevant, weil ich nur leere Boosters löschen will
      con.query(
        "DELETE FROM cards WHERE booster_id = '" + boosterId + "'",
        function (err, result) {
          if (err) throw err;
        }
      );

      con.query(
        "DELETE FROM booster WHERE booster_id = '" + boosterId + "'",
        function (err, result) {
          if (err) throw err;
        }
      );

      
    }
//NICHT FUNKTIONAL
    async function DBUpdateBoosterOwner(boosterId, playerId, lobbyId)
    {
      //Irgendwie muss ich noch an die draft Position des Besitzers kommen
      const owner = await DBReadUser(playerId);
      const ownerDraftPositiion = owner[0].draft_position;
      const lobby= await DBReadLobby(lobbyId);
      const lobbySize = lobby[0].max_players;


      if(ownerDraftPositiion == lobbySize)
      {
        ownerDraftPositiion = 0;
      }
      else {
        ownerDraftPositiion++;
      }

  
      
      

      con.query(
        "UPDATE boosters SET player_id = '" + newOwnerId + "' WHERE booster_id = '" + boosterId + "'",
        function (err, result) {
          if (err) throw err;
        }
      );

  
    }

  //Table Cards
  async function DBUpdateCard(playerId, cardId)
  {
    //Deck des Spielers auslesen um die Karte diesem hinzufügen zu können
   const deck = await DBReadDeck(playerId)
   const deckId = deck[0].deck_id;

    console.log(deckId);

    con.query(
     "UPDATE cards SET booster_id = 'kein Booster'  WHERE card_id = '" + cardId + "'", 
    function (err, result) {
        if (err) throw err;
        }
      );

    con.query(
      "UPDATE cards SET deck_id = '" + deckId + "'  WHERE card_id = '" + cardId + "'",
      function (err, result) {
          if (err) throw err;
          }
        );

  }
    
