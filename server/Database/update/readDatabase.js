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

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stateOfTheGame",

});


async function DBReadUser(userId) {
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

async function DBReadAllUsers()
{
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM players", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        }
    );
});
}


async function DBReadNextPlayer(lobbyId, nextPosition) {
    return new Promise((resolve, reject) => {
        // Cast the draft_position to match the type we're comparing against
        con.query("SELECT * FROM players WHERE lobby_id = ? AND CAST(draft_position AS SIGNED) = ?", 
            [lobbyId, nextPosition], 
            function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

async function DBReadDeck(userId) {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM decks WHERE player_id = '" + userId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);

            }

        });
    })
}

async function DBReadAllLobbys() {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM lobbys", function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);

            }

        });
    })

}

async function DBReadLobby(lobbyId) {


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

async function DBReadLobbyPlayers(lobbyId) {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM players WHERE lobby_id = '" + lobbyId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }

        });
    })

}

async function DBReadBooster(playerId) {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM boosters WHERE player_id = '" + playerId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }

        });
    })
}

async function DBReadBoosterCards(boosterId) {

    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM cards WHERE booster_id = '" + boosterId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

async function DBReadCard(cardId) {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM cards WHERE card_id = '" + cardId + "'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }

        });
    })
}

