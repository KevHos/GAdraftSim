//Dokument um die Datenbank "State of the Game" zu erstellen

async function printToDatabase() {

    var mysql = require('mysql');

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",

    });
    //Connect 
    con.connect(function (err) {
        if (err) throw err;
        console.log("connected");
    });
    //Drop Database
    var sql = 'DROP DATABASE IF EXISTS stateOfTheGame';
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Dropped Database");
    })
    //Create Database
    var sql = 'CREATE DATABASE stateOfTheGame';
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Created Database");
    })
    //Use Database
    var sql = 'USE stateOfTheGame';
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("using Database");
    })



    //Folgender Code für Tables!

    
var sql = `
CREATE TABLE editions (
    edition_id VARCHAR(255) NOT NULL, 
    PRIMARY KEY (edition_id)
)
`;
con.query(sql, function (err, result) {
if (err) throw err;
console.log("Table editions created");
})

//Kann ich sicherlich noch in einen einzelnen Query umwandeln, läuft aber derzeit und muss nur einmalig aufgerufen werden
con.query("INSERT INTO editions (edition_id) VALUES('doaalter')");
con.query("INSERT INTO editions (edition_id) VALUES('ftc')");
con.query("INSERT INTO editions (edition_id) VALUES('alc')");
con.query("INSERT INTO editions (edition_id) VALUES('mrc')");
con.query("INSERT INTO editions (edition_id) VALUES('amb')");



    var sql = `
    CREATE TABLE lobbys (
        lobby_id VARCHAR(255) NOT NULL, 
        host_name VARCHAR(255),
        state ENUM('open', 'closed') NOT NULL, 
        max_players INT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        edition_id VARCHAR(255), 
        gamemode VARCHAR(255), 
        bots INT, 
        time INT,
        boosters INT, 
        round_number INT, 
        PRIMARY KEY (lobby_id), 
        FOREIGN KEY (edition_id) REFERENCES editions(edition_id)
    )
`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table lobbys created");
});

var sql = `
    CREATE TABLE players (
        player_id VARCHAR(255) NOT NULL, 
        lobby_id VARCHAR(255), 
        name VARCHAR(255), 
        draft_position INT, 
        connected BOOLEAN DEFAULT FALSE, 
        is_bot BOOLEAN DEFAULT FALSE,
        draft_state ENUM('picked', 'not_picked') NOT NULL,
        PRIMARY KEY (player_id), 
        FOREIGN KEY (lobby_id) REFERENCES lobbys(lobby_id)
    )
`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table players created");
});

var sql = `
    CREATE TABLE boosters (
        booster_id VARCHAR(255) NULL, 
        player_id VARCHAR(255), 
        state ENUM('active', 'empty') NOT NULL, 
        edition_id VARCHAR(255), 
        position INT,
        PRIMARY KEY (booster_id), 
        FOREIGN KEY (player_id) REFERENCES players(player_id), 
        FOREIGN KEY (edition_id) REFERENCES editions(edition_id)
    )
`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table boosters created");
});

var sql = `
    CREATE TABLE decks (
        deck_id VARCHAR(255) NULL, 
        player_id VARCHAR(255), 
        PRIMARY KEY (deck_id), 
        FOREIGN KEY (player_id) REFERENCES players(player_id)
    )
`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table decks created");
});

var sql = `
    CREATE TABLE cards (
        card_id VARCHAR(255) NOT NULL, 
        uu_id VARCHAR(255), 
        name VARCHAR(255), 
        memory INT, 
        reserve INT, 
        element VARCHAR(255), 
        rarity INT, 
        slug_edition VARCHAR(255), 
        picture TEXT, 
        deck_id VARCHAR(255), 
        booster_id VARCHAR(255), 
        PRIMARY KEY (card_id), 
        FOREIGN KEY (deck_id) REFERENCES decks(deck_id), 
        FOREIGN KEY (booster_id) REFERENCES boosters(booster_id)
    )
`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table cards created");
});

con.end((error) => {
    if (error) {
        console.error('Error closing MySQL connection:', error);
        return;
    }
    console.log("MySQL connection closed.");
});

    
}

printToDatabase();