// Card Class
class Card {
    constructor(uu_id, name, memory, reserve, element, rarity, slug_edition, card_id) {
        this.uu_id = uu_id;
        this.name = name;
        this.memory = memory;
        this.reserve = reserve;
        this.element = element;
        this.rarity = rarity;
        this.slug_edition = slug_edition;
        this.picture = `https://ga-index-public.s3.us-west-2.amazonaws.com/cards/${slug_edition}.jpg`;
        this.card_id = card_id;
    }
}

class BoosterPack{
    constructor(owner, state, edition ,cards){
    this.booster_id = uuidv4();
    this.owner = owner;
    this.state = state;
    this.edition = edition;
    this.cards = cards;
   
    }

}

const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');

// Globals
let edition = "amb";
// Database Query Function
async function readOutDatabase(rarity, amount) {
    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "cardDatabase",
    });

    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ?? WHERE rarity = ? ORDER BY RAND() LIMIT ?`;
        con.query(sql, [edition, rarity, amount], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
                
            }
        });

        con.end((error) => {
            if (error) {
                console.error("Error closing MySQL connection:", error);
            }
            
        });
    });
}

function createCard(data) {
    return new Card(
        data.uu_id,
        data.name,
        data.memory,
        data.reserve,
        data.element,
        data.rarity,
        data.slug_edition,
        uuidv4()
    );
}


function createBooster(owner, state, edition, cards) {
   
    return new BoosterPack(owner, state, edition, cards);
}

async function fetchCardsByRarity(rarity, count) {
    try {
        const results = await readOutDatabase(rarity, count);
        return results.map(createCard);
    } catch (error) {
        console.error("Error fetching cards:", error);
    }
}

async function generateBooster(owner, editionbrowser, gamemode) {

    console.log(owner, editionbrowser, gamemode);
    
    if (gamemode == "draft") {
       common = 10;
       uncommon = 4;
       rare = 1;
    } else if (gamemode == "draft+") 
    {
        common = 7;
        uncommon = 3;
        rare = 4;
        
    }else if (gamemode == "sealed") 
    {
        common = 60;
        uncommon = 24;
        rare = 6;
    }
    
    console.log(common, uncommon, rare);
    
    booster = []; 
    edition = editionbrowser;
    state = "active";

    //Add commons
    const commons = await fetchCardsByRarity(1, common);
    booster.push(...commons);

    //Add uncommons
    const uncommons = await fetchCardsByRarity(2, uncommon);
    booster.push(...uncommons);

    //Add rare+. Derzeit hardcoded, verschiedene Editionen haben aber anscheinend verschiedene Chancen
    for(x = 0; x < rare; x++) {
        const random = Math.random();
        let rareRarity;
        if (random < 0.5) {
            rareRarity = 3;
        } else if (random < 0.8) {
            rareRarity = 4;
        } else {
            rareRarity = 5;
        }
        const rares = await fetchCardsByRarity(rareRarity, 1);

        if(rares.length == 0) {
            x = x - 1;
        }
        booster.push(...rares);
    }
    
   


    return await createBooster(owner, state, edition, booster);
    
}

module.exports = { generateBooster };
