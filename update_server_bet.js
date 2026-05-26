const fs = require('fs');
let content = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

// 1. Revert ludo_create to not require betAmount
content = content.replace(
`        const roomId = generateRoomId();
        const betAmount = parseInt(data.betAmount) || 0;
        const user = activeUsers.get(socket.id) || { username: data.name };
        
        if (betAmount > 0) {
            if (!db.users || !db.users[user.username] || db.users[user.username].wallet < betAmount) {
                return socket.emit('ludo_error', 'Insufficient balance for this bet.');
            }
        }
        const game = new LudoGame(roomId, betAmount);`,
`        const roomId = generateRoomId();
        const game = new LudoGame(roomId, 0);`
);

// 2. Add ludo_set_bet handler
const ludoStartPos = content.indexOf(`    socket.on('ludo_start', () => {`);
if (ludoStartPos !== -1) {
    const toInsert = `    socket.on('ludo_set_bet', (data) => {
        const game = getLudoRoom(socket.id);
        if (!game || game.state !== 'waiting') return;
        
        // Ensure only host can change it
        if (game.players[0].socketId !== socket.id) {
            return socket.emit('ludo_error', 'Only the host can adjust the betting stakes.');
        }

        const newBet = parseInt(data.betAmount) || 0;
        
        // Validate all current human players have enough balance
        for (let p of game.players) {
            if (!p.isBot) {
                if (!db.users || !db.users[p.name] || db.users[p.name].wallet < newBet) {
                    return socket.emit('ludo_error', \`Player \${p.name} only has \${db.users[p.name]?.wallet || 0} LKR. Cannot raise bet.\`);
                }
            }
        }

        game.betAmount = newBet;
        broadcastGameState(game, io);
        io.to(game.roomId).emit('ludo_event', { type: 'bet_update', message: \`💰 Stakes updated to \${newBet} LKR\` });
    });

`;
    content = content.slice(0, ludoStartPos) + toInsert + content.slice(ludoStartPos);
}

fs.writeFileSync('h:\\chatbot\\server\\index.js', content);
