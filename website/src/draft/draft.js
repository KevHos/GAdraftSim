//Das ist die Website mit der Logik für das Drafting. Die Karten werden als Divs erstellt und passend auf der Website angeordnet. 


import React, { useEffect, useState } from "react";
import "../styles/draft.css";
import { fetchBooster, pickCard } from "./api";
import { socket } from '../utils/socket';
import cardBack from '../assets/cardback.jpg';


/* Das Dokument hatte ich deutlich unschöner schon in Javascript geschrieben und war auch funktional, 
was allerdings nach der Migration auf React nicht mehr der Fall war.
Cody hat mir hier viel geholfen, da ich in React noch nicht so vertraut bin.
Besonders die dynamisch erstellen Boxen anhand eines Arrays sind cleverere Lösungen als meine.
 */

function Draft({ currentLobby }) {
    const [currentBooster, setCurrentBooster] = useState(null);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [boxes, setBoxes] = useState(Array(7).fill([]));
    const [showCardBacks, setShowCardBacks] = useState(true); // State for showing card backs




    useEffect(() => {
        socket.on("start_draft", () => {
            
            socket.emit("generateBooster", {currentUser : socket.id});
        });

        socket.on("booster_generated", (booster) => {
            setCurrentBooster(booster);
            console.log("Booster im Client: ", booster);
            
            setShowCardBacks(true); // Rücksseite der Karte beim Laden des Boosters anzeigen
            // Karten nach 5 Sekunden umdrehen
            setTimeout(() => {
                setShowCardBacks(false);
            }, 3000);
        });

        return () => {
            socket.off("start_draft");
            socket.off("generateBooster");
            socket.off("booster_generated");
        };
    }, []);


    useEffect(() => {
        // Wenn die Lobby geändert wird, dann setze ich Booster, derzeitig ausgewählte Karte und den Inhalt der Boxen auf 0
        setCurrentBooster(null);
        setSelectedCardId(null);
        setBoxes(Array(7).fill([]));
    }, [currentLobby]);

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

            
            socket.emit("draft_pick", {
                user_id: socket.id,
                booster_id: currentBooster.booster_id,
                card_id: selectedCardId,
            });

            // Karte in die passende Box hinzufügen
            addCardToBox(pickedCard);

            // Entferne nur die aktuelle Kartee aus dem aktuellen Booster
            /* setCurrentBooster((prev) => ({
                ...prev,
                cards: prev.cards.filter((card) => card.card_id !== selectedCardId),
            })); */

            // Das gesamte Booster löschen
            setSelectedCardId(null);
            setCurrentBooster(null);
            
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
                        className={`card_div ${selectedCardId === card.card_id ? "selected" : ""}`}
                        onClick={() => handleCardClick(card.card_id)}
                    >
                        <div className="card_container">
                            <div className={`card_inner ${showCardBacks ? "flipped" : ""}`}>
                                <div className="card_face back">
                                    <img
                                        id={card.card_id}
                                        className="card_pic"
                                        src={cardBack}
                                        alt="Card Back"
                                    />
                                </div>
                                <div className="card_face front">
                                    <img
                                        id={card.card_id}
                                        className="card_pic"
                                        src={card.picture}
                                        alt={card.name}
                                    />
                                </div>
                            </div>
                        </div>
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
