const fs = require('fs');

let indexJs = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

const resetLogic = `
    socket.on('ludo_reset', () => {
        const game = getLudoRoom(socket.id);
        if (game && game.state === 'finished') {
            game.winningsDistributed = false; // reset winnings flag
            
            // Re-deduct bets from human players
            const user = activeUsers.get(socket.id);
            if (user && db.users[user.username]) {
                let canRematch = true;
                
                // First check if everyone has enough
                game.players.forEach(p => {
                    if (!p.isBot && db.users[p.name]) {
                        if (db.users[p.name].wallet < game.betAmount) {
                            canRematch = false;
                        }
                    }
                });
                
                if (!canRematch) {
                    socket.emit('receive_message', {
                        id: \`sys_\${Date.now()}\`,
                        senderName: 'SYSTEM',
                        senderId: 'system',
                        text: \`Rematch failed. A player has insufficient funds (\${game.betAmount} LKR).\`,
                        isEncrypted: false,
                        isUser: false,
                        timestamp: new Date()
                    });
                    return;
                }
                
                game.players.forEach(p => {
                    if (!p.isBot && db.users[p.name]) {
                        db.users[p.name].wallet -= game.betAmount;
                        db.users[p.name].history.unshift({ type: 'cash_out', amount: game.betAmount, reason: 'Rematch Bet', date: new Date().toISOString() });
                        io.to(p.socketId || p.sid).emit('wallet_update', db.users[p.name]);
                    }
                });
            }

            game.resetGame();
            
            const msg = {
                id: \`gc_\${Date.now()}\`,
                sender: 'SYSTEM',
                colorIdx: -1,
                text: \`🔄 Rematch initiated! \${game.betAmount > 0 ? \`(\${game.betAmount} LKR stake deducted)\` : ''}\`,
                timestamp: Date.now()
            };
            game.gameChat.push(msg);
            
            broadcastGameState(game, io);
        }
    });
`;

if (!indexJs.includes('ludo_reset')) {
    indexJs = indexJs.replace('socket.on("shop_buy",', resetLogic + '\n    socket.on("shop_buy",');
    fs.writeFileSync('h:\\chatbot\\server\\index.js', indexJs);
    console.log('Rematch logic injected.');
}
