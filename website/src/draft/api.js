//Datei für die API abrufe über den Server um die gewählte Karten an den Server/Datenbank zu senden
//Mittlerweile fast überflüssig, dank der Socket.io Verbindung

const API_BASE_URL = "http://localhost:3500/api/draft";




//API-Aufruf zum Bestätigen des Picks

export const pickCard = async ({ user_id, booster_id, card_id }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pick`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id, booster_id, card_id }),
        });
        if (!response.ok) throw new Error("Failed to pick card");
    } catch (error) {
        console.error("Error picking card:", error);
        throw error;
    }
};
