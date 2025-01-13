
//Mittlerweileüberflüssig, dank der Socket.io Verbindung und nur noch als Beispiel hinterlegt

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
