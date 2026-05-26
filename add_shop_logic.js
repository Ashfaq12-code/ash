const fs = require('fs');

let serverContent = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

// 1. Update biometric_auth to init inventory
const authTarget = `            socket.emit("auth_success", { username, wallet: db.users[username].wallet, gotBonus });`;
const authNew = `            if (!db.users[username].inventory) {
                db.users[username].inventory = {
                    tokens: ['standard'],
                    boards: ['classic'],
                    selectedToken: 'standard',
                    selectedBoard: 'classic'
                };
                saveDb();
            }
            socket.emit("auth_success", { username, wallet: db.users[username].wallet, gotBonus, inventory: db.users[username].inventory });`;

serverContent = serverContent.replace(authTarget, authNew);

// 2. Add Shop Listeners
const shopLogic = `
    socket.on("shop_buy", (data) => {
        const user = activeUsers.get(socket.id);
        if (!user || !db.users[user.username]) return;

        const { itemId, price, type } = data;
        const u = db.users[user.username];

        if (u.wallet < price) {
            return socket.emit('ludo_error', 'Insufficient funds in AURA-WALLET.');
        }

        if (!u.inventory) u.inventory = { tokens: ['standard'], boards: ['classic'], selectedToken: 'standard', selectedBoard: 'classic' };
        
        const listKey = type === 'token' ? 'tokens' : 'boards';
        if (u.inventory[listKey].includes(itemId)) {
            return socket.emit('ludo_error', 'Item already owned.');
        }

        u.wallet -= price;
        u.inventory[listKey].push(itemId);
        u.history.unshift({ type: 'cash_out', amount: price, reason: \`Neural Gear: Purchased \${itemId}\`, date: new Date().toISOString() });
        saveDb();

        socket.emit('wallet_update', u);
        socket.emit('system_broadcast', { text: \`[NETWORK ALERT]: \${user.username} has acquired rare neural gear: \${itemId}.\`, sender: 'system' });
    });

    socket.on("shop_equip", (data) => {
        const user = activeUsers.get(socket.id);
        if (!user || !db.users[user.username]) return;
        const { itemId, type } = data;
        const u = db.users[user.username];
        if (!u.inventory) return;
        
        const listKey = type === 'token' ? 'tokens' : 'boards';
        if (u.inventory[listKey].includes(itemId)) {
            if (type === 'token') u.inventory.selectedToken = itemId;
            else if (type === 'board') u.inventory.selectedBoard = itemId;
            saveDb();
            socket.emit('wallet_update', u);
        }
    });\n`;

const lastListener = serverContent.lastIndexOf('});');
serverContent = serverContent.slice(0, lastListener + 3) + shopLogic + serverContent.slice(lastListener + 3);

fs.writeFileSync('h:\\chatbot\\server\\index.js', serverContent);
console.log('Server Shop Logic Added');
