//Die Connection für die Datenbankabfragen mit einem MYSQL Pooling, damit ich nicht mehr als x Anfragen zulasse


const mysql = require('mysql2');
const {dbHost, dbUser, dbPassword} = require('../../server.js')

const pool = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: "stateOfTheGame",
    connectionLimit: 10, 
    queueLimit: 0,
    waitForConnections: true,
});


module.exports = {
    query: (sql, params) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                connection.query(sql, params, (error, results) => {
                    connection.release(); // Release connection back to pool
                    
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        });
    }
};


/* // Periodische Logs der derzeitigen connections
setInterval(() => {
    console.log('Pool statistics:', {
        all: pool._allConnections.length,
        acquired: pool._acquiringConnections.length,
        free: pool._freeConnections.length
    });
}, 5000);

// Logs wenn connection hergestellt und getrennt werden
pool.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
    console.log('New connection established. ThreadId:', connection.threadId);
});

pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId);
});

pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
}); */