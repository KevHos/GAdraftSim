//Dokument um die Datenbank "CardDatabase" zu erstellen. Hier wird auch die API des Herstellers

class Card {
    constructor(name, memory, reserve, element, rarity, slug_edition, card_id) {
        this.name = name;
        this.memory = memory;
        this.reserve = reserve;
        this.element = element;
        this.rarity = rarity;
        this.slug_edition = slug_edition;
        this.picture =
            "https://ga-index-public.s3.us-west-2.amazonaws.com/cards/" +
            slug_edition +
            ".jpg";
        this.card_id = card_id;
    }
}

class Edition {
    constructor(name, array) {
        this.name = name;
        this.array = array;
    }
}

//Das ist die Abkürzung der Edition und gibt daher an welche Edition ich über die API beziehe
let prefix_edition;
//Page für die Seiten der API Ausgabe
let page = 1;

//Array für alle unsortierten Karten einer Edition
let all_cards = [];

//Array um die Editionen zu speichern
let all_editions = [];
let all_editions_values = [];

//Array für alle Karten innerhalb einer Abfrage
let obj_cards = [];

//Das fertige Array mit allen Editionen und Karten
let editions_obj = [];

//Variablen um in die Arrays der API zu durchlaufen
let index_page = 0;
let index_card = 0;


// Funktion zum Erstellen der Karte
function createCard(all_cards) {
    return new Card(

        //In all_cards der erste Index ist die page, dann kommt.data und der nächste Index ist die Karte
        all_cards[index_page].data[index_card].name,
        all_cards[index_page].data[index_card].cost_memory,
        all_cards[index_page].data[index_card].cost_reserve,
        all_cards[index_page].data[index_card].element,
        all_cards[index_page].data[index_card].editions[0].rarity,
        all_cards[index_page].data[index_card].editions[0].slug,
        all_cards[index_page].data[index_card].editions[0].card_id,
    );
}
function createEdition() {
    return new Edition(
        prefix_edition,
        obj_cards,
    );
}


async function getData() {
    const response = await fetch("https://api.gatcg.com/cards/search?page=" + page + "&prefix=" + prefix_edition);
    const draft_cards = await response.json();
    all_cards.push(draft_cards);

}

async function getEditions() {
    const response = await fetch("https://api.gatcg.com/option/search");
    const draft_editions = await response.json();
    all_editions.push(draft_editions);

}


async function generateEditions() {
    await getEditions();

    for (let set of all_editions) {
        for (let x of set.set) {

            x.value;
            all_editions_values.push(x.value);

        }
    }

}

async function generateCards() {

    await generateEditions();

    //Erstelle alle Karten für JEDE Edition
    for (let x = 0; x < all_editions_values.length; ++x) {
        prefix_edition = all_editions_values[x];


        do {
            await getData();
            page++;

            //Die API gibt nur 50 Karten per page aus innerhalb einer Edition aus, weswegen ich das für jede Seite durchlaufen muss
        } while (page <= all_cards[0].total_pages + 1)


        //So oft ausführen die das Array pages hat
        for (let i = 0; i <= all_cards[0].total_pages; i++) {




            //So oft ausführen wie die Anzahl an Karten
            for (let j = 0; j < all_cards[index_page].paginated_cards_count; j++) {

                //Erstelle die Karte und füge die in das obj_cards Array ein
                const card = await createCard(all_cards);
                obj_cards.push(card);
                index_card++;

            }

            index_page++;
            index_card = 0;

        }

        //Der Prefix der Edition muss vor dem erstellen des Objekts bereinigt werden, da in der späteren Datenbank keine leerstellen sein dürfen.
        //An anderer Stelle muss der Prefix aber noch "raw" sein um bei der API die richtigen Daten zu fetchen
        let a = prefix_edition;
        let b = a.replaceAll(" ", "");
        let c = b.replaceAll("-", "");
        prefix_edition = c;

        //Erstellung des Editionsobjektes

        const edition = await createEdition();
        editions_obj.push(edition);


        //resets für die nächste Edition
        index_page = 0;
        obj_cards = [];
        all_cards = [];
        page = 0;

    }


}



//Karten in MYSQL schreiben

let index_edition = 0;



async function printToDatabase() {

    await generateCards();

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
    var sql = 'DROP DATABASE IF EXISTS cardDatabase';
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Dropped Database");
    })
    //Create Database
    var sql = 'CREATE DATABASE cardDatabase';
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Created Database");
    })
    //Use Database
    var sql = 'USE cardDatabase';
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("using Dtabase");
    })


    for (let x = 0; x < editions_obj.length; x++) {



        // Table erstellen

        var sql = `
        CREATE TABLE ${editions_obj[index_edition].name} (
            ID INT NOT NULL AUTO_INCREMENT,
            uu_id VARCHAR(255),
            name VARCHAR(255),
            memory INT,
            reserve INT,
            element VARCHAR(255),
            rarity INT,
            slug_edition VARCHAR(255),
            picture TEXT,
            PRIMARY KEY (ID)
        )
    `;
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        })

        // Daten in die Tabelle schreiben

        for (let y = 0; y < editions_obj[x].array.length; y++) {
            let card = editions_obj[x].array[y];


            var sqlInsert = `
                INSERT INTO ${editions_obj[x].name} 
                (ID, uu_id, name, memory, reserve, element, rarity, slug_edition, picture) 
                VALUES (ID, ?, ?, ?, ?, ?, ?, ?, ?)`;

            var values = [
                card.card_id,
                card.name,
                card.memory,
                card.reserve,
                card.element,
                card.rarity,
                card.slug_edition,
                card.picture,

            ];

            con.query(sqlInsert, values, function (err, result) {
                if (err) throw err;
                console.log(`Card "${card.name}" inserted.`);
            });
        }
        index_edition++;
    }


    con.end((error) => {
        if (error) {
            console.error('Error closing MySQL connection:', error);
            return;
        }
        console.log("MySQL connection closed.");
    });


}



printToDatabase();