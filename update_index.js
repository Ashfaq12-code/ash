const fs = require('fs');

let content = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

// 1. db structure
content = content.replace(
`let db = {
    stats: { totalMessages: 0, aiInterventions: 0, activeCalls: 0 },
    messages: []
};`,
`let db = {
    stats: { totalMessages: 0, aiInterventions: 0, activeCalls: 0 },
    messages: [],
    users: {}
};`
);

// 2. biometric_auth wallet init
content = content.replace(
`        // Wait for the simulated encryption animation
        setTimeout(() => {
            const username = data?.forceUsername || \`Agent_\${Math.floor(Math.random() * 9000) + 1000}\`;
            const userObj = { id: socket.id, username: username, status: "online", joinTime: new Date() };
            activeUsers.set(socket.id, userObj);

            socket.emit("auth_success", { username });`,
`        // Wait for the simulated encryption animation
        setTimeout(() => {
            const username = data?.forceUsername || \`Agent_\${Math.floor(Math.random() * 9000) + 1000}\`;
            
            if (!db.users) db.users = {};
            if (!db.users[username]) {
                db.users[username] = { wallet: 15000, history: [{ type: 'cash_in', amount: 15000, reason: 'First Login Bonus', date: new Date().toISOString() }] };
                saveDb();
            }

            const userObj = { id: socket.id, username: username, status: "online", joinTime: new Date() };
            activeUsers.set(socket.id, userObj);

            socket.emit("auth_success", { username, wallet: db.users[username].wallet });
            socket.emit("wallet_update", db.users[username]);`
);

// 3. distributeLudoWinnings and get_wallet
const ludoHandlersIndex = content.indexOf('// ── LUDO SOCKET HANDLERS');
const toInsert = `    socket.on("get_wallet", () => {
        const user = activeUsers.get(socket.id);
        if (user && db.users && db.users[user.username]) {
            socket.emit("wallet_update", db.users[user.username]);
        }
    });

function distributeLudoWinnings(game, ioRef) {
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
}

`;
if (ludoHandlersIndex !== -1) {
    content = content.slice(0, ludoHandlersIndex) + toInsert + content.slice(ludoHandlersIndex);
} else {
    console.log("Could not find LUDO SOCKET HANDLERS");
}

// 4. ludo_create
content = content.replace(
`        const roomId = generateRoomId();
        const game = new LudoGame(roomId);`,
`        const roomId = generateRoomId();
        const betAmount = parseInt(data.betAmount) || 0;
        const user = activeUsers.get(socket.id) || { username: data.name };
        
        if (betAmount > 0) {
            if (!db.users || !db.users[user.username] || db.users[user.username].wallet < betAmount) {
                return socket.emit('ludo_error', 'Insufficient balance for this bet.');
            }
        }
        const game = new LudoGame(roomId, betAmount);`
);

// 5. ludo_join
content = content.replace(
`        const game = ludoRooms.get(data.roomId);
        if (!game) return socket.emit('ludo_error', 'Room not found');
        if (game.state !== 'waiting') return socket.emit('ludo_error', 'Game already started');

        const existingRoom = getLudoRoom(socket.id);`,
`        const game = ludoRooms.get(data.roomId);
        if (!game) return socket.emit('ludo_error', 'Room not found');
        if (game.state !== 'waiting') return socket.emit('ludo_error', 'Game already started');

        const user = activeUsers.get(socket.id) || { username: data.name };
        if (game.betAmount > 0) {
            if (!db.users || !db.users[user.username] || db.users[user.username].wallet < game.betAmount) {
                return socket.emit('ludo_error', 'Insufficient balance for this bet.');
            }
        }

        const existingRoom = getLudoRoom(socket.id);`
);

// 6. ludo_start
content = content.replace(
`        const result = game.startGame();
        if (result.error) return socket.emit('ludo_error', result.error);`,
`        if (game.betAmount > 0) {
            for (let p of game.players) {
                if (!p.isBot) {
                    if (!db.users || !db.users[p.name] || db.users[p.name].wallet < game.betAmount) {
                        return socket.emit('ludo_error', \`Player \${p.name} has insufficient balance.\`);
                    }
                }
            }
            game.players.forEach(p => {
                if (!p.isBot) {
                    db.users[p.name].wallet -= game.betAmount;
                    db.users[p.name].history.unshift({ type: 'cash_out', amount: game.betAmount, reason: 'Ludo Bet', date: new Date().toISOString() });
                    const targetSocket = io.sockets.sockets.get(p.socketId);
                    if (targetSocket) targetSocket.emit('wallet_update', db.users[p.name]);
                }
            });
            saveDb();
        }

        const result = game.startGame();
        if (result.error) return socket.emit('ludo_error', result.error);`
);

// 7. ludo_roll win
content = content.replace(
`                if (moveRes.won) {
                    const finishedPlayer = game.players[game.rankings[game.rankings.length - 1]];
                    const suffix = moveRes.rank === 1 ? 'st' : moveRes.rank === 2 ? 'nd' : moveRes.rank === 3 ? 'rd' : 'th';
                    io.to(game.roomId).emit('ludo_event', { type: 'win', message: \`🏆 \${finishedPlayer.name} finished in \${moveRes.rank}\${suffix} place!\` });
                }`,
`                if (moveRes.won) {
                    const finishedPlayer = game.players[game.rankings[game.rankings.length - 1]];
                    const suffix = moveRes.rank === 1 ? 'st' : moveRes.rank === 2 ? 'nd' : moveRes.rank === 3 ? 'rd' : 'th';
                    io.to(game.roomId).emit('ludo_event', { type: 'win', message: \`🏆 \${finishedPlayer.name} finished in \${moveRes.rank}\${suffix} place!\` });
                    if (game.state === 'finished') distributeLudoWinnings(game, io);
                }`
);

// 8. ludo_move win
content = content.replace(
`        if (result.won) {
            const finishedPlayer = game.players[game.rankings[game.rankings.length - 1]];
            const suffix = result.rank === 1 ? 'st' : result.rank === 2 ? 'nd' : result.rank === 3 ? 'rd' : 'th';
            io.to(game.roomId).emit('ludo_event', { type: 'win', message: \`🏆 \${finishedPlayer.name} finished in \${result.rank}\${suffix} place!\` });
        }`,
`        if (result.won) {
            const finishedPlayer = game.players[game.rankings[game.rankings.length - 1]];
            const suffix = result.rank === 1 ? 'st' : result.rank === 2 ? 'nd' : result.rank === 3 ? 'rd' : 'th';
            io.to(game.roomId).emit('ludo_event', { type: 'win', message: \`🏆 \${finishedPlayer.name} finished in \${result.rank}\${suffix} place!\` });
            if (game.state === 'finished') distributeLudoWinnings(game, io);
        }`
);

// 9. bot win
content = content.replace(
`                    if (moveResult.won) {
                        triggerBanter('win');
                        io.to(game.roomId).emit('ludo_event', { type: 'win', message: \`🏆 \${currentPlayer.name} finished!\` });
                    }`,
`                    if (moveResult.won) {
                        triggerBanter('win');
                        io.to(game.roomId).emit('ludo_event', { type: 'win', message: \`🏆 \${currentPlayer.name} finished!\` });
                        if (game.state === 'finished') distributeLudoWinnings(game, io);
                    }`
);

fs.writeFileSync('h:\\chatbot\\server\\index.js', content);
