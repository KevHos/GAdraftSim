//Funktionen um die Datenbank zu befüllen, noch nicht fertig.

const mysql = require('mysql');

module.exports = {
    DBCreateUser,
    DBWriteConnectFalse,
    DBWriteConnectTrue,
    DBCreateLobby,
    DBDeleteLobby
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


