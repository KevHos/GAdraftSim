import io from 'socket.io-client';

/* Erstelleung des Sockets für den Client.
Ich musste den Socket in ein eigenständiges File auslagern,
da es sonst an diversen Stellen vorkam, dass ein Browser sich mehrere Sockets erstellt hat
 */
export const socket = io('http://192.168.64.110:3500', {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true
});


