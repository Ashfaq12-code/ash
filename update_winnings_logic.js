const fs = require('fs');

let serverContent = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

const oldDistribute = `function distributeLudoWinnings(game, ioRef) {
    if (game.betAmount <= 0 || game.winningsDistributed) return;
    game.winningsDistributed = true;

    const totalPot = game.betAmount * game.players.length;
    let payouts = [];

    if (game.players.length >= 3) {
        payouts = [0.7 * totalPot, 0.3 * totalPot];
    } else {
        payouts = [totalPot];
    }

    game.rankings.forEach((playerIdx, rankIndex) => {
        const p = game.players[playerIdx];
        const payout = payouts[rankIndex] || 0;
        if (payout > 0 && !p.isBot && db.users[p.name]) {
            db.users[p.name].wallet += payout;
            db.users[p.name].history.unshift({ type: 'cash_in', amount: payout, reason: \`Ludo Win (Rank \${rankIndex + 1})\`, date: new Date().toISOString() });
            if (db.users[p.name].history.length > 50) db.users[p.name].history.pop();
            const targetSocket = ioRef.sockets.sockets.get(p.socketId);
            if (targetSocket) {
                targetSocket.emit('wallet_update', db.users[p.name]);
                targetSocket.emit('ludo_event', { type: 'payout', message: \`💸 You won \${payout} LKR!\` });
            }
        }
    });
    saveDb();
}`;

const newDistribute = `function distributeLudoWinnings(game, ioRef) {
    if (game.betAmount <= 0 || game.winningsDistributed) return;
    game.winningsDistributed = true;

    const totalPot = game.betAmount * game.players.length;
    let payouts = [];

    if (game.players.length >= 3) {
        payouts = [0.7 * totalPot, 0.3 * totalPot];
    } else {
        payouts = [totalPot];
    }

    game.rankings.forEach((playerIdx, rankIndex) => {
        const p = game.players[playerIdx];
        const payout = payouts[rankIndex] || 0;
        if (payout > 0 && !p.isBot && db.users[p.name]) {
            db.users[p.name].wallet += payout;
            db.users[p.name].history.unshift({ type: 'cash_in', amount: payout, reason: \`Ludo Win (Rank \${rankIndex + 1})\`, date: new Date().toISOString() });
            if (db.users[p.name].history.length > 50) db.users[p.name].history.pop();
            
            ioRef.to(p.socketId).emit('wallet_update', db.users[p.name]);
            ioRef.to(p.socketId).emit('ludo_event', { 
                type: 'payout', 
                message: \`🏆 VICTORY! \${payout} LKR added to your AURA-WALLET.\`,
                payout: payout
            });
        }
    });

    const losers = game.players.filter(p => p.isBot && !game.rankings.slice(0, 1).includes(game.players.indexOf(p)));
    if (losers.length > 0) {
        const soreLoser = losers[Math.floor(Math.random() * losers.length)];
        const comments = [
            "Wait... that was a glitch in the matrix! Rematch? 🤡",
            "You got lucky this time. My neural processors were lagging! 🤖",
            "Impossible! I demand a recount of the grid! 😤",
            "GG... but I'm coming back stronger. Who else wants to lose? 🎲",
            "This isn't over. I'll get my LKR back in the next round! 🔥"
        ];
        setTimeout(() => {
            const msg = game.addChatMessage(soreLoser.socketId, comments[Math.floor(Math.random() * comments.length)]);
            if (msg) ioRef.to(game.roomId).emit('ludo_chat_msg', msg);
        }, 2000);
    }

    saveDb();
}`;

serverContent = serverContent.replace(oldDistribute, newDistribute);
fs.writeFileSync('h:\\chatbot\\server\\index.js', serverContent);
console.log('Server Logic Updated');
