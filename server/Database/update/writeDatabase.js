//Funktionen um die Datenbank zu befüllen, noch nicht fertig.
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');

const { DBReadUser, DBReadLobby, DBReadDeck, DBReadBooster, DBReadLobbyPlayers, DBReadNextPlayer } = require('./readDatabase.js')

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
  DBUpdateUserState,
  DBNextRound,



}

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "stateOfTheGame",

});
//Tables Players    
async function DBCreateUser(userId) {

  con.query(
    "INSERT INTO players (player_id, connected, is_Bot, draft_state) VALUES ('" + userId + "', TRUE, FALSE, 'not_picked')",
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

async function DBJoinUser(userId, lobbyId, playerName) {
  con.query(
    "UPDATE players SET lobby_id = '" + lobbyId + "', name = '" + playerName + "' WHERE player_id = '" + userId + "'",
    function (err, result) {
      if (err) throw err;
    }
  );
}

async function DBLeaveUser(userId) {
  con.query(
    "UPDATE players SET lobby_id = NULL WHERE player_id = '" + userId + "'",
    function (err, result) {
      if (err) throw err;
    }
  );
}

async function DBWriteConnectFalse(userId) {
  con.query(
    "UPDATE players SET connected = FALSE WHERE player_id = '" + userId + "'",
    function (err, result) {
      if (err) throw err;
    })
}

async function DBWriteConnectTrue(userId) {
  con.query(
    "UPDATE players SET connected = True WHERE player_id = '" + userId + "'",
    function (err, result) {
      if (err) throw err;
    })
}

async function DBWriteDraftPosition(position, userId) {

  position++;

  con.query(
    "UPDATE players SET draft_position = '" + position + "' WHERE player_id = '" + userId + "'",
    function (err, result) {
      if (err) throw err;
    })
}

//Unbedingt noch mal anfassen, da der Name irreführend ist.
//Ich könnte sie "Switch-State" nennen und je nach derzeitigem State auf den anderen wechseln.
async function DBUpdateUserState(user_id, state) {
  con.query(
    "UPDATE players SET draft_state = '" + state + "' WHERE player_id = '" + user_id + "'",
    function (err, result) {
      if (err) throw err;
    })
}





//Table Lobbys

async function DBCreateLobby(lobbyName, playerName, lobbySize, edition, gameMode, bots, boosters, timer) {
  var sqlInsert = `INSERT INTO lobbys (lobby_id, state, created_at, host_name, max_players, edition_id, gamemode, bots, time, round_number, boosters)
    VALUES (?, 'open', NOW(), ?,?,?,?,?,?, 1, ?)`;
  var values = [lobbyName, playerName, lobbySize, edition, gameMode, bots, timer, boosters];
  con.query(sqlInsert, values, function (err, result) {
    if (err) throw err;
  }
  );
}

async function DBNextRound(lobbyId) {
  con.query(
    "UPDATE lobbys SET round_number = round_number + 1 WHERE lobby_id = '" + lobbyId + "'",
    function (err, result) {
      if (err) throw err;
    })
}

async function DBDeleteLobby(lobbyName) {
  con.query(
    "DELETE FROM lobbys WHERE lobby_id = '" + lobbyName + "'",
    function (err, result) {
      if (err) throw err;
    })
}

//Table Booster und Cards

async function DBCreateBooster(booster) {

  var boosterId = booster.booster_id;
  var playerId = booster.owner;
  var state = booster.state;
  var editionId = booster.edition;

  console.log("Booster ID: " + boosterId);
  console.log("Player ID: " + playerId);
  console.log("State: " + state);
  console.log("Edition ID: " + editionId);




  con.query(
    "INSERT INTO boosters (booster_id, player_id, state, edition_id, position) VALUES ('" + boosterId + "', '" + playerId + "', '" + state + "', '" + editionId + "', 1)",
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
    "DELETE FROM boosters WHERE booster_id = '" + boosterId + "'",
    function (err, result) {
      if (err) throw err;
    }
  );


}
async function DBUpdateBoosterOwner(lobbyId) {
  const players = await DBReadLobbyPlayers(lobbyId);
  const lobby = await DBReadLobby(lobbyId);

  // Temporäres Array für die Booster-Zuordnung
  let boosterMoves = [];

  // Erst alle Booster und ihre neuen Besitzer ermitteln
  for (let i = 0; i < players.length; i++) {
    let playerId = players[i].player_id;
    let player = await DBReadUser(playerId);
    let currentPosition = player[0].draft_position;
    let booster = await DBReadBooster(playerId);

    let nextPosition;
    if (lobby.round_number % 2 == 0) {
      // Gerade Runde - nach links
      nextPosition = currentPosition === 1 ? players.length : currentPosition - 1;
    } else {
      // Ungerade Runde - nach rechts
      nextPosition = currentPosition === players.length ? 1 : currentPosition + 1;
    }


    let nextPlayer = await DBReadNextPlayer(lobbyId, nextPosition);

    boosterMoves.push({
      boosterId: booster[0].booster_id,
      newOwnerId: nextPlayer[0].player_id
    });
  }

  console.log("Verschiebe die Boooster......");

  // Dann alle Booster auf einmal aktualisieren
  for (let move of boosterMoves) {
    await new Promise((resolve, reject) => {
      con.query(
        "UPDATE boosters SET player_id = ? WHERE booster_id = ?",
        [move.newOwnerId, move.boosterId],
        function (err, result) {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
}



//Table Cards
async function DBUpdateCard(playerId, cardId) {
  //Deck des Spielers auslesen um die Karte diesem hinzufügen zu können
  const deck = await DBReadDeck(playerId)
  const deckId = deck[0].deck_id;

  console.log(deckId);



  con.query(
    "UPDATE cards SET booster_id = NULL  WHERE card_id = '" + cardId + "'",
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

