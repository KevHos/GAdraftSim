//Die Connection für die Datenbankabfragen mit einem MYSQL Pooling, damit ich nicht mehr als x Anfragen zulasse


const mysql = require('mysql');

const{dbHost,dbUser, dbPassword} = require('../../server.js')

const pool = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: "stateOfTheGame",
    connectionLimit: 50 // Maximale Anzahl gleichzeitiger Verbindungen
});

module.exports = {
    query: (sql, params) => {
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
};
