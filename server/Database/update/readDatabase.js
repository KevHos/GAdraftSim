const mysql = require('mysql');

module.exports = {
    DBReadUser,
    DBReadLobby,
}

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stateOfTheGame",
  
  });


  async function DBReadUser(userId)
{
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM players WHERE player_id = '" + userId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
                
                
                
            }
        
        });
    })
}

async function DBReadLobby(lobbyId)
{


    
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM lobbys WHERE lobby_id = '" + lobbyId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
        
                
                
            }
        
        });
    })
}
