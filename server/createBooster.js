//In diesem Dokument werden die Objekte der Booster und Karten erstellt und mit den Kartenwerten der CardDatabase befüllt.


class Card {
    constructor(uu_id, name, memory, reserve, element, rarity, slug_edition) {
        this.uu_id = uu_id;
        this.name = name;
        this.memory = memory;
        this.reserve = reserve;
        this.element = element;
        this.rarity = rarity;
        this.slug_edition = slug_edition;
        this.picture = `https://ga-index-public.s3.us-west-2.amazonaws.com/cards/${slug_edition}.jpg`;
        this.card_id = uuidv4();
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
    state = "active";
}

const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');

// Database Query Function
async function readOutDatabase(rarity, amount) {
    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "cardDatabase",
    });
try{
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ?? WHERE rarity = ? ORDER BY RAND() LIMIT ?`;
        con.query(sql, [edition, rarity, amount], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
                
            }
        });
    });
        con.end();
        return result;}
        catch (error) {
            con.end();
            throw error;
        }
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

   // console.log("BoosterPack generated: Owner: " + owner+ " Edition: " +editionbrowser+ " Gamemode: "+ gamemode);
    
    if (gamemode == "draft") {
       common = 10;
       uncommon = 4;
       rare = 1;
    } else if (gamemode == "draft+") 
    {
        common = 7;
        uncommon = 4;
        rare = 4;
        
    }else if (gamemode == "draft+m") 
    {
        common = 10;
        uncommon = 10;
        rare = 10;
    }
    
    let booster = []; 
    edition = editionbrowser;
    state = "active";

   
   //console.log(`Target counts - Common: ${common}, Uncommon: ${uncommon}, Rare: ${rare}`);

    //Add commons
    const commons = await fetchCardsByRarity(1, common);
    //console.log(`Commons fetched: ${commons.length}`);
    booster.push(...commons);

    //Add uncommons
    const uncommons = await fetchCardsByRarity(2, uncommon);
    //console.log(`Uncommons fetched: ${uncommons.length}`);
    booster.push(...uncommons);
    
    //Add rares
    //Mit der Logik hatte ich diverse Probleme, da einige Editionen nicht alle raritys haben und die Datenbank daher leere Ergebnisse ausgeteilt hat.
    let rareCount = 0;
    const maxAttempts = 10; // Maximale Versuche pro Karte, um Endlos-Schleifen zu vermeiden
    const rarities = [3, 4, 5]; // Mögliche Rarities für rare-Karten
    
    for (let i = 0; i < rare; i++) {
        let attempts = 0;
        let cardAdded = false;
    
        while (!cardAdded && attempts < maxAttempts) {
            attempts++;
    
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
            if (rares.length > 0) {
                booster.push(...rares);
                rareCount++;
                cardAdded = true;
            }
        }
    
        // Fallback: Wenn nach maxAttempts keine Karte gefunden wurde, prüfe alternative Rarities
        if (!cardAdded) {
            for (const fallbackRarity of rarities) {
                const fallbackRares = await fetchCardsByRarity(fallbackRarity, 1);
                if (fallbackRares.length > 0) {
                    booster.push(...fallbackRares);
                    rareCount++;
                    break; 
                }
            }
        }
    }

    
    
   // console.log(`Rares fetched: ${rareCount}`);  

    // Das Booster sortieren, damit die seltensten Karten am Anfang des Boosters sind
    booster.sort((b,a) => a.rarity - b.rarity);


    return await createBooster(owner, state, edition, booster);
    
}

module.exports = { generateBooster };
