import React, { useEffect, useState } from "react";
import "../styles/draft.css";
import { fetchBooster, pickCard } from "./api"; 
import { socket } from '../utils/socket';


/* Das Dokument hatte ich deutlich unschöner schon in Javascript geschrieben und war auch funktional, 
was allerdings nach der Migration auf React nicht mehr der Fall war.
Cody hat mir hier viel geholfen, da ich in React noch nicht so vertraut bin.
Besonders die dynamisch erstellen Boxen anhand eines Arrays sind cleverere Lösungen als meine.
 */

function Draft({ currentLobby, currentUser }) {
    const [currentBooster, setCurrentBooster] = useState(null);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [boxes, setBoxes] = useState(Array(7).fill([]));

    useEffect(() => {
        socket.on("start_draft", () => {
            loadBooster();
        });
    
        return () => {
            socket.off("start_draft");
        };
    }, [currentUser, currentLobby]); 
    
    async function loadBooster() {
        const booster = await fetchBooster(currentUser, currentLobby);
        setCurrentBooster(booster);
    }
    

    // Card selection handler
    const handleCardClick = (cardId) => {

        setSelectedCardId(cardId);
    };


    // Confirm pick handler
    const handleConfirmPick = async () => {
        if (!selectedCardId || !currentBooster) return;
    
        try {
            // Karte abrufen
            const pickedCard = currentBooster.cards.find(card => card.card_id === selectedCardId);
    
            // API-Aufruf zum Bestätigen des Picks
            await pickCard({
                user_id: "test",
                booster_id: currentBooster.booster_id,
                card_id: selectedCardId,
            });
    
            // Karte in die passende Box hinzufügen
            addCardToBox(pickedCard);
    
            // UI aktualisieren: Entferne die Karte aus dem Booster
            setCurrentBooster((prev) => ({
                ...prev,
                cards: prev.cards.filter((card) => card.card_id !== selectedCardId),
            }));
            setSelectedCardId(null);
        } catch (error) {
            console.error("Error confirming pick:", error);
        }
    };
    
    // Mit der Funktion werden die Karten sortiert und in die richtigen Boxen eingefügt
    const addCardToBox = (card) => {
        if (card.reserve === null || card.memory) {
            setBoxes((prevBoxes) => {
                const updatedBoxes = [...prevBoxes];
                updatedBoxes[6] = [...updatedBoxes[6], card];
                return updatedBoxes;
            });
        } else {
            const reserveCost = Math.min(card.reserve, 5);
            setBoxes((prevBoxes) => {
                const updatedBoxes = [...prevBoxes];
                updatedBoxes[reserveCost] = [...updatedBoxes[reserveCost], card];
                return updatedBoxes;
            });
        }
    };
    

    return (
        <div className="container_top">
            <button
                onClick={handleConfirmPick}
                id="button_confirm"
                className="button_pick"
                disabled={!selectedCardId}
            >
                Confirm Pick
            </button>

            <div className="large_box" id="large_box">
                {currentBooster?.cards.map((card) => (
                    <div
                        key={card.card_id}
                        className={`card_div ${
                            selectedCardId === card.card_id ? "selected" : ""
                        }`}
                        onClick={() => handleCardClick(card.card_id)}
                    >
                        <img
                            id={card.card_id}
                            className="card_pic"
                            src={card.picture}
                            alt={card.name}
                        />
                        <h3 hidden>{card.name}</h3>
                        <p hidden>Memory: {card.memory}</p>
                        <p hidden>Reserve: {card.reserve}</p>
                        <p hidden>Element: {card.element}</p>
                        <p hidden>Rarity: {card.rarity}</p>
                    </div>
                ))}
            </div>

            <div className="bottom_container">
    {boxes.map((boxCards, i) => (
        <div className="small_box" id={i === 6 ? "boxnull" : `box${i}`} key={i}>
            <div className="small_box_header">
                <div className="small_box_header_left" id={i === 6 ? "headernulls" : `header${i}`}>
                    <span className="variable_display" id={i === 6 ? "head_variablenull" : `head_variable${i}`}>
                        {boxCards.length}
                    </span>
                </div>
                <div className="small_box_header_text">
                    {i === 6 ? "Materialize" : i === 5 ? "Reserve: 5+" : `Reserve: ${i}`}
                </div>
            </div>
            <div className="small_box_content" style={{ height: `${(boxCards.length * 35) + 250}px` }}>
    {boxCards.map((card, index) => (
        <img
            key={card.card_id}
            className="card_pic_small"
            src={card.picture}
            alt={card.name}
            style={{
                top: `${index * 35}px`,
                zIndex: index + 1
            }}
        />
    ))}
</div>

        </div>
    ))}
</div>


        </div>
    );
}

export default Draft;
