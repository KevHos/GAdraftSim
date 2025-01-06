<h1>#GAdraftSim</h1>

GAdraftSim ist eine Website, die einen Draft-Simulator für ein weniger bekanntes Sammelkartenspiel bereitstellt. Spieler können Lobbys erstellen, diesen beitreten, miteinander chatten und gemeinsam am Draft teilnehmen.

<h2>Was ist ein Draft?</h2>
Ein Draft in einem Sammelkartenspiel ist ein Spielmodus, bei dem Spieler aus einer begrenzten Auswahl an Karten ein Deck zusammenstellen, statt ein vorgefertigtes Deck zu nutzen. Dabei öffnet jeder Spieler eine Kartenpackung, wählt eine Karte daraus, gibt die übrigen Karten an den nächsten Spieler weiter und wiederholt diesen Prozess, bis alle Karten verteilt sind.<br>
<br>

![Draft](https://github.com/KevHos/GAdraftSim/blob/main/Dokumentation/Screenshots/Draft2.png)

<h2>Disclaimer</h2>

Dieses Projekt ist ein persönliches Hobby, das ich in meiner Freizeit neben der Ausbildung kontinuierlich weiterentwickle. Die Website befindet sich noch am Anfang, stellt für mich allerdings eine spannende und motivierende Herausforderung dar, die ich mit Leidenschaft verfolge.

<h2>Projektplanung:</h2>

<h4>Bereits umgesetzt:</h4>
-Fetch der API des Herstellers, um alle Karten des Spiels in meine MYSQL Datenbank zu importieren.<br>
-Zufällige Karten anhand von Edition und Seltenheit aus der Datenbank abrufbar gemacht.<br>
-Booster und Karten mit eindeutigen IDs versehen.<br>
-Gestaltung einer Website für den eigentlichen Draft-Prozess.<br>
-Logik für das Draften von Karten und Sortierung der Karten im persönlichen Kartenpool.<br>
-Aufteilung des Projekts in Frontend und Backend.<br>
-Den Server über Javascript/Express aufgesetzt und CORS Problematik beseitigt.<br>
-Socket.IO für Lobbys und den Chat integriert.<br>
-Planung der Datenbankstruktur für den "StateoftheGame".<br>

<h4>Teilweise oder noch nicht umgesetzt: </h4>
-Automatisches Speichern und Abrufen von Karten-, Spieler-, Booster- und Lobby-Zuständen in der Datenbank.<br>
-Implementierung des Boostertauschs zwischen Spielern und Übergabe der Karten in den Besitz der jeweiligen Spieler.<br>
-Aufteilung des Drafts in Runden mit Echtzeit-Benachrichtigungen über Ereignisse.<br>
-Einbau eines Timers zur Zeitbegrenzung während des Drafts.<br>
-Anzeige der aktuellen Booster-Position und der verbleibenden Zeit.<br>
-Möglichkeit für Spieler, nach dem Draft ihre Deckliste als Textdatei zu exportieren oder ins Clipboard zu kopieren.<br>
-Entwicklung von Schnittstellen zu anderen Websites, um Decks dort zu speichern (z. B. shoutatyourdecks).<br>
<br>

![Deck am Ende des Drafts](https://github.com/KevHos/GAdraftSim/blob/main/Dokumentation/Screenshots/DraftEnd.png)


<h2>Verwendete Technologien</h2>

1. React
   - Die Frontendentwicklung gestaltete sich schnell als umständlich und unübersichtlich, weswegen ich ein Framework brauchte um mir die Arbeiten daran zu erleichtern.<br>
   - React gibt mir die Möglichkeit, HTML in Javascript Files zu verwenden und so auch HTML auf verschiedene Dokumente auszugliedern und im Nachhinein wieder hinzuzufügen um die Übersichtlichkeit zu bewahren.<br>
   - Die Hooks und Effects von React sind zudem sehr nützlich, jedoch stehe ich da noch am Anfang des Verständnisses.<br>

2. Express
   - Anfänglich war mein Projekt ein reines Offline-Projekt und ich brauchte ein Tool um schnell und effizient einen Server aufzusetzen.<br>
   - Express war hier das perfekte Tool um in Javascript zu bleiben und diese Funktionalitäten nutzen zu können<br>
   - CORS war anfänglich eine große Problematik beim fetchen der API des Herstellers, die aber von Express mit einer einzigen Methode abgedeckt wird.

3. Socket.IO
   - Mit diesem Part hab ich lange mit mir gekämpft, da ich nicht wusste in welche Richtung ich gehen sollte.<br>
   - Ich denke hier hätte es viele verschiedene Möglichkeiten gegeben z.b. die Client-Anfragen über eine Rest-API laufen zu lassen aber letztendlich habe ich mich für Socket.IO entschieden.<br>
   - Socket.IO stach heraus, dank der guten Dokumentation und der breiten Community, die dieses Tool nutzt.<br>
   - Zudem erlaubte es mir ohne großen Aufwand ein Chat-System in meine Website zu integrieren, was alleine durch regelmäßige API Abfragen wohlmöglich viele Ressourcen gekostet hätte<br>
   <br>

![Lobby](https://github.com/KevHos/GAdraftSim/blob/main/Dokumentation/Screenshots/Lobby.png)

<h2>Struktur des Projektfolders</h2>

Das Projekt ist grundlegend in 2 Kategorien gegliedert, die sich in Website(Client) und Server aufteilen.<br>

<h4>Server</h4>

1. Database (Beinhaltet alle Methoden um meine Databases zu erstellen, auszulesen oder zu beschreiben.)<br>
   - create (Beinhaltet Scripts zur Löschung und Erstellung der Databases.)<br>
   - update (Beinhaltet alle Methoden um die Database "stateofthegame" auszulesen und upzudaten.)<br>
  
2. createBooster.js (Dieses File liest die MYSQL Datenbank aus und erstellt dem Spieler ein Booster, basierend auf der Edition des Boosters und dem Spielmodus.)<br>

3. server.js (Dieses Dokument ist das Herzstück des Servers, indem alle Anfragen an den Server entgegen genommen und verarbeitet werden.)<br>

<h4>Client</h4>

Im Client befinden sich derzeit alle relevanten Dokument im Ordner "src".

1. Assets (Beinhaltet diverse Bilder für das Projekt.)<br>

2. Chat (Beinhaltet die clientseitige Chat-Funktionalität.)<br>

3. Draft (Beinhaltet die Logik für das Anzeigen und sortieren der Karten und das grundlegende Design der Website.)<br>

4. Headandfoot (Beinhaltet Header und Footer der Website, wobei der Header noch einige Funktionalitäten für das erstellen und joinen der Lobbys beinhaltet.)<br>

5. Styles (CSS Stylesheets.)<br>

6. Utils (Beinhaltet den Index meiner Website, in dem Funktionen anderer Files zusammen geführt werden und die Dokumente ordnet, damit alles in der richtigen Reihenfolge angezeigt wird.)<br>

<br>

https://github.com/user-attachments/assets/b63dd14a-6cc3-4994-9288-edc7e08f76a2


