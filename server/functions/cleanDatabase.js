const {
    DBReadLobbyPlayers,
    DBReadAllLobbys,
    DBReadAllUsers,
} = require("../Database/update/readDatabase");

const {
    DBDeleteLobby,
    DBDeleteUser,
} = require("../Database/update/writeDatabase");

module.exports = {
    cleanDatabase
}

async function cleanDatabase() {

   
    const lobbys = await DBReadAllLobbys();
    const allPlayers = await DBReadAllUsers();

    console.log("Clean Database:");


    for (let i = 0; i < lobbys.length; i++) {

        players = await DBReadLobbyPlayers(lobbys[i].lobby_id);

        //Deleting empty Lobbys
        if (players.length == 0) {
            await DBDeleteLobby(lobbys[i].lobby_id);
            console.log("Lobby " + lobbys[i].lobby_id + " deleted");
        }

    }

    for (let i = 0; i < allPlayers.length; i++) {
        
        if (allPlayers[i].created_at < Date.now() - 1000 * 60 * 60 *24) {
            await DBDeleteUser(allPlayers[i].player_id);
            console.log("User " + allPlayers[i].player_id + " deleted");
        }
    }







}
