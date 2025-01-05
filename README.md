#GAdraftSim

GAdraftSim ist eine Website, die einen Draft-Simulator für ein weniger bekanntes Sammelkartenspiel bereitstellt. Spieler können Lobbys erstellen, diesen beitreten, miteinander chatten und gemeinsam am Draft teilnehmen.

Was ist ein Draft?<br>
Ein Draft in einem Sammelkartenspiel ist ein Spielmodus, bei dem Spieler aus einer begrenzten Auswahl an Karten ein Deck zusammenstellen, statt ein vorgefertigtes Deck zu nutzen. Dabei öffnet jeder Spieler eine Kartenpackung, wählt eine Karte daraus, gibt die übrigen Karten an den nächsten Spieler weiter und wiederholt diesen Prozess, bis alle Karten verteilt sind.

![Draft](https://github.com/KevHos/GAdraftSim/blob/main/Dokumentation/Screenshots/Draft2.png)

Dieses Projekt ist ein persönliches Hobby, das ich in meiner Freizeit neben der Schule kontinuierlich weiterentwickle. Zu Beginn hatte ich keinerlei Erfahrung mit den verwendeten Technologien: React, Socket.IO, MySQL sowie Frontend- und Backend-Entwicklung. Das Projekt befindet sich noch am Anfang, stellt für mich allerdings eine spannende und motivierende Herausforderung dar, die ich mit Leidenschaft verfolge.

Bereits umgesetzt:

-Fetch der API des Herstellers, um alle Karten des Spiels in meine MYSQL Datenbank zu importieren.<br>
-Zufällige Karten anhand von Edition und Seltenheit aus der Datenbank abrufbar gemacht.<br>
-Booster und Karten mit eindeutigen IDs versehen.<br>
-Gestaltung einer Website für den eigentlichen Draft-Prozess.<br>
-Logik für das Draften von Karten und Sortierung der Karten im persönlichen Kartenpool.<br>
-Aufteilung des Projekts in Frontend und Backend.<br>
-Den Server über Javascript/Express aufgesetzt und CORS Problematik beseitigt.<br>
-Socket.IO für Lobbys und den Chat integriert.<br>
-Planung der Datenbankstruktur für den "StateoftheGame".<br>

Noch zu tun:

-Automatisches Speichern und Abrufen von Karten-, Spieler-, Booster- und Lobby-Zuständen in der Datenbank.<br>
-Implementierung des Boostertauschs zwischen Spielern und Übergabe der Karten in den Besitz der jeweiligen Spieler.<br>
-Aufteilung des Drafts in Runden mit Echtzeit-Benachrichtigungen über Ereignisse.<br>
-Einbau eines Timers zur Zeitbegrenzung während des Drafts.<br>
-Anzeige der aktuellen Booster-Position und der verbleibenden Zeit.<br>
-Möglichkeit für Spieler, nach dem Draft ihre Deckliste als Textdatei zu exportieren oder ins Clipboard zu kopieren.<br>
-Entwicklung von Schnittstellen zu anderen Websites, um Decks dort zu speichern (z. B. shoutatyourdecks).<br>

![Deck am Ende des Drafts](https://github.com/KevHos/GAdraftSim/blob/main/Dokumentation/Screenshots/DraftEnd.png)
![Lobby](https://github.com/KevHos/GAdraftSim/blob/main/Dokumentation/Screenshots/Lobby.png?raw=true)
