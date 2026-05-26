const fs = require('fs');

let content = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

// replace ludo_reset
content = content.replace(
`    socket.on('ludo_reset', () => {
        const game = getLudoRoom(socket.id);
        if (!game) return socket.emit('ludo_error', 'Not in a room');
        game.resetGame();
        broadcastGameState(game, io);
        _triggerBotTurnIfNeeded(game);
    });`,
`    socket.on('ludo_reset', () => {
        const game = getLudoRoom(socket.id);
        if (!game) return socket.emit('ludo_error', 'Not in a room');
        
        if (game.betAmount > 0) {
            for (let p of game.players) {
                if (!p.isBot) {
                    if (!db.users || !db.users[p.name] || db.users[p.name].wallet < game.betAmount) {
                        return socket.emit('ludo_error', \`Player \${p.name} has insufficient balance for a rematch.\`);
                    }
                }
            }
            game.players.forEach(p => {
                if (!p.isBot) {
                    db.users[p.name].wallet -= game.betAmount;
                    db.users[p.name].history.unshift({ type: 'cash_out', amount: game.betAmount, reason: 'Ludo Rematch Bet', date: new Date().toISOString() });
                    const targetSocket = io.sockets.sockets.get(p.socketId);
                    if (targetSocket) targetSocket.emit('wallet_update', db.users[p.name]);
                }
            });
            saveDb();
        }

        game.resetGame();
        game.winningsDistributed = false;
        broadcastGameState(game, io);
        _triggerBotTurnIfNeeded(game);
    });`
);

fs.writeFileSync('h:\\chatbot\\server\\index.js', content);
