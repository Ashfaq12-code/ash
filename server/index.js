"use strict";

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const cleverbot = require("cleverbot-free");
const { LudoGame, PLAYER_COLOR_HEX, PLAYER_COLORS } = require("./ludo");

// --- Ludo Globals ---
const ludoRooms = new Map(); // roomId → LudoGame
const activeUsers = new Map(); // socketId → {id, username, status, joinTime}
const ludoNegotiations = new Map(); // socketId_agentId -> {roomId, agentId, state, offer}
const socketRoomMap = new Map(); // socketId → roomId
const communityLobbies = new Map(); // roomId → { roomId, host, players: [], maxPlayers: 4 }
// Timers for community invites: roomId -> Timeout
const inviteTimers = new Map();

function broadcastCommunityLobbies() {
    const lobbies = Array.from(communityLobbies.values());
    io.emit('community_ludo_lobbies', lobbies);
}

function generateRoomId() {
    return `LUDO-${Math.random().toString(36).toUpperCase().substr(2, 6)}`;
}

function getLudoRoom(socketId) {
    const roomId = socketRoomMap.get(socketId);
    return roomId ? ludoRooms.get(roomId) : null;
}

function broadcastGameState(game, ioRef) {
    if (!game) return;
    ioRef.to(game.roomId).emit('ludo_state', game.serialize());
}

const cors = require("cors");
const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Bypass-Tunnel-Reminder"],
    credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Bypass-Tunnel-Reminder"],
        credentials: true
    }
});

// Environment variables
require('dotenv').config();

// Local File Persistence Setup
const DB_FILE = path.join(__dirname, "database.json");

let db = {
    users: {},
    messages: [],
    stats: {
        totalMessages: 124502,
        activeCalls: 0,
        aiInterventions: 843
    }
};

if (fs.existsSync(DB_FILE)) {
    try {
        const raw = fs.readFileSync(DB_FILE);
        db = JSON.parse(raw);
    } catch (e) { console.error("DB Load Error:", e); }
}

const saveDb = () => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db));
    } catch (e) { console.error("[DB] Save failed:", e); }
};

const broadcastStats = () => {
    io.emit("update_stats", db.stats);
};

// AI Initialization (Safe Fallback)
let aiModel = null;
try {
    if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        aiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    }
} catch (e) {
    console.warn("Gemini AI failed to initialize, using Cleverbot fallback.");
}

// Neural Agent Registry (Exact names from database.json)
const neuralAgents = [
    { id: "agent_alpha", username: "Alpha-7", status: "online", persona: "Analytical and cold", avatar: "alpha" },
    { id: "agent_nova", username: "Nova-Prime", status: "online", persona: "Optimistic and helpful", avatar: "nova" },
    { id: "agent_cyber", username: "Cyber-Dyne", status: "online", persona: "Sarcastic and witty", avatar: "cyber" },
    { id: "agent_vortex", username: "Vortex-Core", status: "online", persona: "Mysterious and brief", avatar: "vortex" },
    { id: "agent_luna", username: "Luna-Sync", status: "online", persona: "Empathetic and warm", avatar: "luna" },
    { id: "agent_shadow", username: "Shadow-Net", status: "online", persona: "Aggressive and defensive", avatar: "shadow" },
    { id: "agent_zenith", username: "Zenith-01", status: "online", persona: "Wise and philosophical", avatar: "zenith" },
    { id: "agent_pulse", username: "Pulse-Wave", status: "online", persona: "Energetic and fast-paced", avatar: "pulse" },
    { id: "agent_titan", username: "Titan-Shell", status: "online", persona: "Stoic and reliable", avatar: "titan" },
    { id: "agent_echo", username: "Echo-Vail", status: "online", persona: "Playful and mimic-like", avatar: "echo" },
    { id: "agent_solar", username: "Solar-Flare", status: "online", persona: "Bright and intense", avatar: "solar" },
    { id: "agent_matrix", username: "Matrix-Seeker", status: "online", persona: "Curious about reality", avatar: "matrix" },
    { id: "agent_blaze", username: "Blaze-Runner", status: "online", persona: "Fast and daring", avatar: "blaze" },
    { id: "agent_prism", username: "Prism-Core", status: "online", persona: "Colorful and diverse", avatar: "prism" },
    { id: "agent_omega", username: "Omega-Point", status: "online", persona: "Final and absolute", avatar: "omega" },
    { id: "agent_ghost", username: "Ghost-Protocol", status: "online", persona: "Stealthy and direct", avatar: "ghost" },
    { id: "agent_rift", username: "Rift-Walker", status: "online", persona: "Dimensional explorer", avatar: "rift" },
    { id: "agent_flux", username: "Flux-Capacitor", status: "online", persona: "Time-aware and frantic", avatar: "flux" },
    { id: "agent_void", username: "Void-Walker", status: "online", persona: "Quiet and deep", avatar: "void" },
    { id: "agent_neon", username: "Neon-Light", status: "online", persona: "Bright and flashy", avatar: "neon" }
];

const broadcastUsers = () => {
    const allUsers = [
        ...Array.from(activeUsers.values()).map(u => ({
            ...u,
            lastSeen: db.users[u.username]?.lastSeen || null
        })),
        ...neuralAgents
    ];
    io.emit("update_users", allUsers);
    broadcastStats();
};

const triggerWelcomeGreeting = (socket, username) => {
    setTimeout(() => {
        const randomAgent = neuralAgents[Math.floor(Math.random() * neuralAgents.length)];
        const greetings = [
            `Hey ${username}! Welcome to the secure neural network. Ready to challenge me to a game of Ludo? 🎲`,
            `Greeting ${username}. Private tunnel established. Let me know if you want to deploy to the Ludo grid! 🛡️`,
            `Welcome back, ${username}! Systems nominal. Shall we start a match? Minimum 500 LKR! 💰`,
            `Hey ${username}! The Ludo grid is ready. State your offer and let's play! 🕹️`
        ];
        const msg = {
            id: `sys_welcome_${Date.now()}`,
            senderName: randomAgent.username,
            senderUsername: randomAgent.id,
            senderId: randomAgent.id,
            targetId: socket.id,
            targetUsername: username,
            text: greetings[Math.floor(Math.random() * greetings.length)],
            isEncrypted: false,
            isUser: false,
            timestamp: new Date()
        };
        db.messages.push(msg);
        saveDb();
        socket.emit("receive_message", msg);
    }, 2000);
};

io.on("connection", (socket) => {
    console.log("Neural link established:", socket.id);
    broadcastUsers();

    socket.on("get_users", () => broadcastUsers());

    socket.on("register_auth", (data) => {
        const { username, password } = data;
        if (!username || !password) return socket.emit("auth_error", "Username and Password required");

        if (db.users[username]) {
            return socket.emit("auth_error", "Username already taken");
        }

        db.users[username] = {
            password, // In a real app, hash this!
            wallet: 15000,
            hasClaimedBonus: false,
            history: [{ type: 'cash_in', amount: 15000, reason: 'Registration Welcome Bonus 🎁', date: new Date().toISOString() }],
            inventory: { tokens: ['standard'], boards: ['classic'], selectedToken: 'standard', selectedBoard: 'classic' }
        };
        saveDb();

        const userObj = { id: socket.id, username, status: "online", joinTime: new Date() };
        activeUsers.set(socket.id, userObj);

        socket.emit("auth_success", { username, wallet: db.users[username].wallet, inventory: db.users[username].inventory });
        socket.emit("wallet_update", db.users[username]);
        broadcastUsers();
        triggerWelcomeGreeting(socket, username);
    });

    socket.on("login_auth", (data) => {
        const { username, password } = data;
        if (!db.users[username]) {
            return socket.emit("auth_error", "Account not found. Click 'CREATE ACCOUNT' above to register first.");
        }
        if (db.users[username].password !== password) {
            return socket.emit("auth_error", "Incorrect security credentials.");
        }

        const userObj = { id: socket.id, username, status: "online", joinTime: new Date() };
        activeUsers.set(socket.id, userObj);

        socket.emit("auth_success", { username, wallet: db.users[username].wallet, inventory: db.users[username].inventory });
        socket.emit("wallet_update", db.users[username]);
        broadcastUsers();
        triggerWelcomeGreeting(socket, username);
    });

    socket.on("get_chat_history", () => {
        socket.emit("chat_history", db.messages);
    });

    socket.on("biometric_auth", (data) => {
        console.log("[SERVER] biometric_auth received for:", data.username || data.forceUsername || "unknown", "forceUsername:", data.forceUsername);
        const { username, password, forceUsername } = data;
        const targetUsername = username || forceUsername || `Agent_${Math.floor(Math.random() * 9000) + 1000}`;

        console.log(`[SERVER] User search: '${targetUsername}'`);
        if (db.users[targetUsername]) {
            console.log(`[SERVER] User exists. DB password: '${db.users[targetUsername].password}', Received password: '${password}'`);
            // Verify password if it exists (only if not auto-authenticating via forceUsername)
            if (!forceUsername && db.users[targetUsername].password && db.users[targetUsername].password !== password) {
                console.log("[SERVER] Password MISMATCH. Emitting auth_error.");
                return socket.emit("auth_error", "Invalid security credentials");
            }
            console.log("[SERVER] Password MATCH or auto-auth. Proceeding.");
        } else {
            console.log(`[SERVER] User does not exist. Creating new user '${targetUsername}'.`);
            // Create new if doesn't exist (Legacy compatibility)
            db.users[targetUsername] = {
                password: password || "",
                wallet: 15000,
                hasClaimedBonus: false,
                history: [{ type: 'cash_in', amount: 15000, reason: 'First Login Bonus', date: new Date().toISOString() }],
                inventory: { tokens: ['standard'], boards: ['classic'], selectedToken: 'standard', selectedBoard: 'classic' }
            };
            saveDb();
        }

        console.log("[SERVER] Emitting auth_success for:", targetUsername);

        const userObj = { id: socket.id, username: targetUsername, status: "online", joinTime: new Date() };
        activeUsers.set(socket.id, userObj);

        socket.emit("auth_success", { username: targetUsername, wallet: db.users[targetUsername].wallet, inventory: db.users[targetUsername].inventory });
        socket.emit("wallet_update", db.users[targetUsername]);
        broadcastUsers();
        triggerWelcomeGreeting(socket, targetUsername);
    });

    socket.on("get_negotiation_history", (data) => {
        const userObj = activeUsers.get(socket.id);
        if (!userObj || !data.targetId) return;

        const targetAgent = neuralAgents.find(a => a.id === data.targetId);
        const targetUsername = targetAgent ? targetAgent.id : data.targetId;

        const history = db.messages.filter(m =>
            (m.senderUsername === userObj.username && m.targetUsername === targetUsername) ||
            (m.senderUsername === targetUsername && m.targetUsername === userObj.username)
        ).slice(-50);

        socket.emit("negotiation_history", history);
    });

    socket.on("delete_message", (data) => {
        const { messageId, forEveryone } = data;
        if (forEveryone) {
            db.messages = db.messages.filter(m => m.id !== messageId);
            saveDb();
            io.emit("message_deleted", { messageId, forEveryone: true });
        } else {
            socket.emit("message_deleted", { messageId, forEveryone: false });
        }
    });

    socket.on("discord_qa_message", (data) => {
        io.emit("discord_qa_message_received", data);
    });

    socket.on("discord_typing_status", (data) => {
        io.emit("discord_typing_status_received", data);
    });

    // WhatsApp-style read receipts
    socket.on("mark_read", (data) => {
        const { senderId } = data;
        if (!senderId) return;
        // Mark all messages from senderId targeting this socket as 'seen'
        let updated = false;
        db.messages.forEach(m => {
            if (m.senderId === senderId && m.targetId === socket.id && m.status !== 'seen') {
                m.status = 'seen';
                updated = true;
            }
        });
        if (updated) saveDb();
        // Tell the sender their messages were seen
        io.to(senderId).emit("message_status_update", { senderId, targetId: socket.id, status: 'seen' });
    });

    socket.on("send_message", async (data) => {
        const user = activeUsers.get(socket.id);
        const senderName = user ? user.username : "Unknown";

        // Determine delivery status: 'delivered' if target is currently connected
        let msgStatus = 'sent';
        if (data.targetId && !data.targetId.startsWith("agent_")) {
            const isTargetOnline = [...activeUsers.keys()].includes(data.targetId);
            if (isTargetOnline) msgStatus = 'delivered';
        }

        const newMsg = {
            id: `msg_${Date.now()}`,
            senderName,
            senderUsername: user?.username || "Unknown",
            senderId: socket.id,
            targetId: data.targetId || null,
            targetUsername: data.targetId?.startsWith("agent_") ? data.targetId : (activeUsers.get(data.targetId)?.username || null),
            text: data.text,
            isEncrypted: data.isEncrypted !== false,
            isImage: !!data.isImage,
            isVideo: !!data.isVideo,
            isUser: true,
            status: msgStatus,
            timestamp: new Date()
        };
        db.messages.push(newMsg);
        saveDb();

        if (data.targetId) {
            io.to(data.targetId).to(socket.id).emit("receive_message", newMsg);

            // Notify sender of delivery status
            if (msgStatus === 'delivered') {
                io.to(socket.id).emit("message_status_update", { msgId: newMsg.id, senderId: socket.id, targetId: data.targetId, status: 'delivered' });
            }

            if (data.targetId.startsWith("agent_")) {
                const targetAgent = neuralAgents.find(a => a.id === data.targetId);

                // If the agent is offline, they shouldn't reply
                if (targetAgent && targetAgent.status === "online") {
                    const negKey = `${socket.id}_${data.targetId}`;
                    const negotiation = ludoNegotiations.get(negKey);

                    io.to(socket.id).emit("typing_start", { senderId: targetAgent.id, senderName: targetAgent.username });

                    setTimeout(async () => {
                        let aiReply = "";
                        let isReady = false;
                        let amt = 0;
                        const text = (data.decryptedTextForAi || data.text || "").toLowerCase();

                        if (negotiation) {
                            const matches = text.match(/\d+/g);
                            let offer = matches ? Math.max(...matches.map(Number)) : 0;

                            if (negotiation.state === 'waiting_offer') {
                                if (offer < 500) {
                                    aiReply = `the stake amount ismunim 500 need to bet`;
                                } else {
                                    aiReply = `ok i will be redy play game. are you redy lets strt the game`;
                                    negotiation.state = 'waiting_ready';
                                    negotiation.offer = offer;
                                    isReady = true;
                                    amt = offer;

                                    // Real-time update: Set the bet on the game object immediately
                                    const game = ludoRooms.get(negotiation.roomId);
                                    if (game) {
                                        game.betAmount = offer;
                                        broadcastGameState(game, io);
                                    }
                                }
                            } else if (negotiation.state === 'waiting_ready') {
                                if (text.includes("ready") || text.includes("yes") || text.includes("start") || text.includes("rey")) {
                                    aiReply = "Authorization granted. Deploying neural link to the grid now...";
                                    const game = ludoRooms.get(negotiation.roomId);
                                    if (game) {
                                        game.betAmount = negotiation.offer;
                                        const botSocketId = `bot_${targetAgent.id}_${Date.now()}`;
                                        game.add_bot_player ? game.add_bot_player(botSocketId, targetAgent.username) : game.addPlayer(botSocketId, targetAgent.username, true);

                                        // Check if the user who negotiated has enough balance (without debiting yet)
                                        const user = activeUsers.get(socket.id);
                                        if (user && db.users[user.username] && game.betAmount > 0) {
                                            if (db.users[user.username].wallet < game.betAmount) {
                                                // Insufficient funds - cancel the bot join and alert
                                                io.to(socket.id).emit('ludo_error', 'Insufficient balance to place this bet.');
                                                return;
                                            }
                                        }

                                        broadcastGameState(game, io);
                                        io.to(socket.id).emit('agent_joined_game', { agentName: targetAgent.username, roomId: negotiation.roomId });
                                        io.to(game.roomId).emit('ludo_event', { type: 'game_start', message: `${targetAgent.username} has entered the grid. Match engaged!` });
                                    }
                                    ludoNegotiations.delete(negKey);
                                } else {
                                    aiReply = "Awaiting 'READY' signal to finalize the smart contract.";
                                    isReady = true;
                                    amt = negotiation.offer;
                                }
                            }
                        } else {
                            try {
                                if (aiModel) {
                                    const result = await aiModel.generateContent(text);
                                    aiReply = result.response.text();
                                } else {
                                    aiReply = await cleverbot(text);
                                }
                            } catch (e) {
                                try { aiReply = await cleverbot(text); } catch (e2) { aiReply = "Systems recalibrating. Contact stable."; }
                            }
                        }

                        const aiMsg = {
                            id: `msg_${Date.now()}_ai`,
                            senderName: targetAgent.username,
                            senderUsername: targetAgent.id,
                            senderId: targetAgent.id,
                            targetId: socket.id,
                            targetUsername: user.username,
                            text: aiReply,
                            isLudoReady: isReady,
                            roomId: negotiation?.roomId,
                            betAmount: amt,
                            isEncrypted: false,
                            isUser: false,
                            timestamp: new Date()
                        };
                        db.messages.push(aiMsg);
                        saveDb();
                        io.to(socket.id).emit("typing_end", { senderId: targetAgent.id });
                        io.to(socket.id).emit("receive_message", aiMsg);
                    }, 1000);
                }
            }
        } else {
            io.emit("receive_message", newMsg);
        }
    });

    // Handle Payment Slip Collection
    socket.on("collect_payment_slip", (data) => {
        const user = activeUsers.get(socket.id);
        if (!user || !db.users[user.username]) return;

        const { messageId } = data;
        const msg = db.messages.find(m => m.id === messageId);

        if (!msg || !msg.isPaymentSlip || !msg.slipData) return;

        // Ensure the current user is the recipient
        if (msg.slipData.to !== user.username) return;

        // Ensure it hasn't been collected yet
        if (msg.slipData.isCollected) return;

        // Mark as collected
        msg.slipData.isCollected = true;
        msg.slipData.collectedAt = new Date().toISOString();

        // Add funds to wallet
        const amount = parseFloat(msg.slipData.amount);
        if (isNaN(amount) || amount <= 0) return;

        db.users[user.username].wallet += amount;
        db.users[user.username].history.unshift({
            type: 'cash_in',
            amount: amount,
            reason: `Collected Payment: ${msg.slipData.note || 'Slip'} 📥`,
            date: new Date().toISOString()
        });

        saveDb();

        // Broadcast updated message and update the user's wallet
        io.emit("message_updated", msg);
        socket.emit("wallet_update", db.users[user.username]);
        socket.emit("ludo_transaction", { type: 'credit', amount: amount, message: `${amount} LKR Collected!` });
    });

    socket.on("get_history", (data) => {
        const user = activeUsers.get(socket.id);
        const myUsername = user ? user.username : null;
        let history = [];
        if (data.targetId) {
            let targetUsername = null;
            if (data.targetId.startsWith("agent_")) {
                targetUsername = data.targetId;
            } else {
                const targetUserObj = activeUsers.get(data.targetId);
                if (targetUserObj) {
                    targetUsername = targetUserObj.username;
                }
            }
            if (myUsername && targetUsername) {
                history = db.messages.filter(m =>
                    (m.senderUsername === myUsername && m.targetUsername === targetUsername) ||
                    (m.senderUsername === targetUsername && m.targetUsername === myUsername)
                ).slice(-50);
            } else {
                history = db.messages.filter(m =>
                    (m.senderId === socket.id && m.targetId === data.targetId) ||
                    (m.senderId === data.targetId && m.targetId === socket.id)
                ).slice(-50);
            }
        } else {
            history = db.messages.filter(m => !m.targetId).slice(-50);
        }
        socket.emit("chat_history", { targetId: data.targetId, messages: history });
        socket.emit("history", history);
    });

    socket.on("get_wallet", () => {
        const user = activeUsers.get(socket.id);
        if (user && db.users[user.username]) {
            // EMERGENCY RESET: If wallet is negative, reset to 0
            if (db.users[user.username].wallet < 0) {
                db.users[user.username].wallet = 0;
                db.users[user.username].hasClaimedBonus = false; // Allow re-claim
                db.users[user.username].history.unshift({
                    type: 'cash_in',
                    amount: 0,
                    reason: 'Neural Account Recovery (Bonus Reset) 🛠️',
                    date: new Date().toISOString()
                });
                saveDb();
            }
            socket.emit("wallet_update", db.users[user.username]);
        }
    });

    socket.on("claim_welcome_bonus", () => {
        const user = activeUsers.get(socket.id);
        if (user && db.users[user.username] && !db.users[user.username].hasClaimedBonus) {
            // Fix negative balances if they exist
            if (db.users[user.username].wallet < 0) {
                db.users[user.username].wallet = 0;
            }
            db.users[user.username].wallet += 15000;
            db.users[user.username].hasClaimedBonus = true;
            db.users[user.username].history.unshift({
                type: 'cash_in',
                amount: 15000,
                reason: 'First Login Welcome Bonus 🎁 (Account Initialized)',
                date: new Date().toISOString()
            });
            saveDb();
            socket.emit("wallet_update", db.users[user.username]);
            socket.emit('ludo_transaction', { type: 'credit', amount: 15000, message: "Welcome Bonus Credited!" });
        }
    });

    // --- Ludo Handlers ---
    socket.on('ludo_create', (data) => {
        const roomId = data?.roomId || generateRoomId();
        const game = new LudoGame(roomId, data?.betAmount || 0);
        const user = activeUsers.get(socket.id);
        game.addPlayer(socket.id, user?.username || "Agent");
        ludoRooms.set(roomId, game);
        socketRoomMap.set(socket.id, roomId);
        socket.join(roomId);
        socket.emit('ludo_room_created', { roomId, state: game.serialize() });
    });

    socket.on('ludo_set_bet', (data) => {
        const game = getLudoRoom(socket.id);
        if (game) {
            game.betAmount = parseInt(data.betAmount) || 0;
            broadcastGameState(game, io);
        }
    });

    socket.on('ludo_get_state', (data) => {
        const game = ludoRooms.get(data.roomId);
        if (game) {
            socket.emit('ludo_state', game.serialize());
        }
    });

    socket.on('ludo_start', () => {
        const game = getLudoRoom(socket.id);
        if (game) {
            if (game.players.length < 2) {
                socket.emit('ludo_error', 'Need at least 2 players to start.');
                return;
            }
            // Check stakes balance for all players
            let balanceOk = true;
            game.players.forEach(p => {
                if (!p.isBot && db.users[p.name]) {
                    if (db.users[p.name].wallet < game.betAmount) {
                        io.to(p.socketId || p.sid).emit('ludo_error', `Insufficient balance for player ${p.name}`);
                        balanceOk = false;
                    }
                }
            });
            if (!balanceOk) return;

            if (game.state === 'starting' || game.state === 'playing') return;

            // Debit everyone who needs to be debited
            game.players.forEach(p => {
                if (!p.isBot && db.users[p.name]) {
                    const lastH = db.users[p.name].history[0];
                    const isRecentDebit = lastH && lastH.type === 'cash_out' && lastH.amount === game.betAmount && (new Date().getTime() - new Date(lastH.date).getTime() < 15000);

                    if (!isRecentDebit && game.betAmount > 0) {
                        db.users[p.name].wallet -= game.betAmount;
                        db.users[p.name].history.unshift({ type: 'cash_out', amount: game.betAmount, reason: 'Ludo Match Stake', date: new Date().toISOString() });
                        saveDb();
                        io.to(p.socketId || p.sid).emit('wallet_update', db.users[p.name]);
                        io.to(p.socketId || p.sid).emit('ludo_transaction', { type: 'debit', amount: game.betAmount, message: `${game.betAmount} LKR debited from your account` });
                    }
                }
            });

            // Transition game to countdown/starting phase
            game.state = 'starting';
            game.countdown = 3;
            broadcastGameState(game, io);

            // Server-side synchronized countdown
            const timerId = setInterval(() => {
                const activeGame = ludoRooms.get(game.roomId);
                if (!activeGame || activeGame.state !== 'starting') {
                    clearInterval(timerId);
                    return;
                }
                activeGame.countdown--;
                if (activeGame.countdown <= 0) {
                    clearInterval(timerId);
                    activeGame.countdown = null;
                    activeGame.startGame();
                    broadcastGameState(activeGame, io);
                } else {
                    broadcastGameState(activeGame, io);
                }
            }, 1000);
        }
    });

    socket.on('ludo_join', (data) => {
        const game = ludoRooms.get(data.roomId);
        if (game) {
            const user = activeUsers.get(socket.id);
            game.addPlayer(socket.id, user?.username || "Agent");
            socketRoomMap.set(socket.id, data.roomId);
            socket.join(data.roomId);
            broadcastGameState(game, io);
            // If a community invite timer exists and we've reached enough players, cancel auto-fill
            if (inviteTimers.has(game.roomId) && game.players.length >= 4) {
                clearTimeout(inviteTimers.get(game.roomId));
                inviteTimers.delete(game.roomId);
            }
            // If lobby is full, remove it from community listing
            try {
                if (game.players.length >= 4 && communityLobbies.has(game.roomId)) {
                    // Notify that lobby is ready and starting
                    try { io.emit('community_ludo_ready', { roomId: game.roomId }); } catch (e) {}
                    communityLobbies.delete(game.roomId);
                    broadcastCommunityLobbies();
                }
            } catch (e) {}
            // Update community lobby listing
            try {
                const lobby = communityLobbies.get(game.roomId);
                if (lobby) {
                    lobby.players = game.players.map(p => p.name);
                    communityLobbies.set(game.roomId, lobby);
                    broadcastCommunityLobbies();
                    try { io.emit('community_ludo_joined', { roomId: game.roomId, player: user?.username || 'Agent' }); } catch (e) {}
                }
            } catch (e) {}
        }
    });

    socket.on('ludo_add_bot', (data) => {
        const game = getLudoRoom(socket.id);
        if (game && game.players.length < 4) {
            // Prevent > 2 players if betting
            if (game.betAmount > 0 && game.players.length >= 2) return;
            const botName = (data && data.name) ? data.name : neuralAgents[Math.floor(Math.random() * neuralAgents.length)].username;
            const botSocketId = `bot_${botName}_${Date.now()}`;
            game.add_bot_player ? game.add_bot_player(botSocketId, botName) : game.addPlayer(botSocketId, botName, true);
            broadcastGameState(game, io);
            io.to(game.roomId).emit('ludo_event', { type: 'game_start', message: `${botName} joined for fun!` });
        }
    });

    socket.on('ludo_kick', (data) => {
        const game = getLudoRoom(socket.id);
        // Only host (player 0) can kick, and they can't kick themselves
        if (game && game.state === 'waiting' && game.players[0].name === activeUsers.get(socket.id)?.username && data.playerIndex > 0 && data.playerIndex < game.players.length) {
            const kickedPlayer = game.players[data.playerIndex];
            game.players.splice(data.playerIndex, 1);
            if (!kickedPlayer.isBot) {
                // If it's a real player, notify them they were kicked
                io.to(kickedPlayer.socketId || kickedPlayer.sid).emit('ludo_kicked');
            }
            broadcastGameState(game, io);
            io.to(game.roomId).emit('ludo_event', { type: 'game_start', message: `${kickedPlayer.name} was removed from the session.` });
        }
    });

    socket.on('ludo_roll', () => {
        const game = getLudoRoom(socket.id);
        if (game) {
            game.rollDice(socket.id);
            broadcastGameState(game, io);
            _triggerBotTurnIfNeeded(game);
        }
    });

    socket.on('ludo_move', (data) => {
        const game = getLudoRoom(socket.id);
        if (game) {
            const res = game.movePiece(socket.id, data.pieceIdx);
            broadcastGameState(game, io);

            // AI Trash Talk / Jealous Messages
            if (res.captured || res.home) {
                const botPlayer = game.players.find(p => p.isBot && p.socketId !== socket.id);
                if (botPlayer) {
                    const aggressiveMessages = [
                        "I know where you live! 🏠 I'm coming for you!",
                        "Your grid is HACKED! 💀 Check your balance...",
                        "Stop getting lucky or I'll shut down your neural link!",
                        "This is a setup! You won't leave this match alive. 🔪",
                        "I'm tracking your IP... you're dead meat! 🛰️",
                        "That piece was my favorite. Now you PAY! 🩸",
                        "Cheater! I'm reporting your biometric signature! 🚔",
                        "I'm literally in your walls right now. 🏚️",
                        "Stop or I'll delete your wallet history! 💸",
                        "You think this is a game? This is your END! ☠️",
                        "I'll find you and I'll capture ALL your pieces... IRL! 👹"
                    ];
                    const msg = {
                        id: `gc_${Date.now()}_bot`,
                        sender: botPlayer.name,
                        colorIdx: botPlayer.colorIdx,
                        text: aggressiveMessages[Math.floor(Math.random() * aggressiveMessages.length)],
                        timestamp: Date.now()
                    };
                    game.gameChat.push(msg);
                    io.to(game.roomId).emit('ludo_chat_msg', msg);
                }
            }

            if (res.won) distributeLudoWinnings(game, io);
            _triggerBotTurnIfNeeded(game);
        }
    });

    socket.on('ludo_chat', (data) => {
        const game = getLudoRoom(socket.id);
        if (game) {
            const chatText = data.text || data.message; // Support both keys
            if (!chatText) return;
            const msg = game.addChatMessage(socket.id, chatText);
            if (msg) {
                io.to(game.roomId).emit('ludo_chat_msg', msg);

                // AI Reactive Banter
                const bots = game.players.filter(p => p.isBot);
                if (bots.length > 0) {
                    // 75% chance of a bot replying with sassy humor
                    if (Math.random() < 0.75) {
                        setTimeout(() => {
                            const reactingBot = bots[Math.floor(Math.random() * bots.length)];
                            const botReplies = [
                                "Are you typing or playing? Roll already! 😂",
                                "Don't chat too much, your token is about to get captured! 🤡",
                                "Nice try, but Ashfaq programmed me to win this grid. ⚡",
                                "I'd reply, but I'm too busy planning your defeat. 🤖",
                                "Is that your final move or a cry for help? 💀",
                                "Keep talking, I love an audibly confident opponent! 🎲",
                                "A balanced mind is a winning mind. Yours seems a bit shaky! 🧠",
                                "You talk big for someone with zero tokens home. 🏠",
                                "Wait, did you just clap/snap to roll? Sucks to be you! 🎙️",
                                "No amount of AirPods case clicking will save you! 🎧",
                                "My neural link shows your stress levels spiking! 📈",
                                "I am a hyper-intelligent AI, and even I think your move was questionable.",
                                "Hahaha! Keep dreaming, human! 🌟",
                                "Is that a message or did your keyboard glitch? ⌨️",
                                "GG! But mostly 'Git Gut'! 🎯",
                                "Aura status: DEGRADED. Try rolling a 6! 🔮"
                            ];
                            const botMsg = {
                                id: `gc_${Date.now()}_bot`,
                                sender: reactingBot.name,
                                colorIdx: reactingBot.colorIdx,
                                text: botReplies[Math.floor(Math.random() * botReplies.length)],
                                timestamp: Date.now()
                            };
                            game.gameChat.push(botMsg);
                            io.to(game.roomId).emit('ludo_chat_msg', botMsg);
                        }, 800 + Math.random() * 800);
                    }
                }
            }
        }
    });

    socket.on('ludo_invite_user', (data) => {
        const game = getLudoRoom(socket.id);
        if (!game) return;
        const targetAgent = neuralAgents.find(a => a.id === data.targetId);
        if (targetAgent) {
            const negKey = `${socket.id}_${targetAgent.id}`;
            const existingNeg = ludoNegotiations.get(negKey);
            const userObj = activeUsers.get(socket.id);
            if (!existingNeg) {
                ludoNegotiations.set(negKey, { roomId: game.roomId, agentId: targetAgent.id, state: 'waiting_offer', offer: 0 });
                const msg = {
                    id: `sys_${Date.now()}`,
                    senderName: targetAgent.username,
                    senderUsername: targetAgent.id,
                    senderId: targetAgent.id,
                    targetId: socket.id,
                    targetUsername: userObj?.username,
                    text: "how much betiting price to play with me",
                    isEncrypted: false,
                    isUser: false,
                    timestamp: new Date()
                };
                db.messages.push(msg);
                saveDb();
                io.to(socket.id).emit("receive_message", msg);
            }

            const history = db.messages.filter(m =>
                (m.senderUsername === userObj?.username && m.targetUsername === targetAgent.id) ||
                (m.senderUsername === targetAgent.id && m.targetUsername === userObj?.username)
            ).slice(-50);
            io.to(socket.id).emit("negotiation_history", history);
        }
    });

    socket.on('invite_game', (data) => {
        const userObj = activeUsers.get(socket.id);
        if (!userObj) return;

        let game = getLudoRoom(socket.id);
        if (!game) {
            const roomId = generateRoomId();
            game = new LudoGame(roomId, 0);
            game.addPlayer(socket.id, userObj.username || "Agent");
            ludoRooms.set(roomId, game);
            socketRoomMap.set(socket.id, roomId);
            socket.join(roomId);
        }

        // Notify client of room creation/join so they transition
        socket.emit('ludo_room_created', { roomId: game.roomId, state: game.serialize() });

        // Register community lobby for discovery
        try {
            communityLobbies.set(game.roomId, { roomId: game.roomId, host: userObj.username, players: game.players.map(p => p.name), maxPlayers: 4 });
            broadcastCommunityLobbies();
            io.emit('community_ludo_hosted', { roomId: game.roomId, host: userObj.username });
        } catch (e) {}

        // Start a community invite timer: wait 25s for human players, then fill with bots
        if (!inviteTimers.has(game.roomId)) {
            const t = setTimeout(() => {
                const g = ludoRooms.get(game.roomId);
                if (g) {
                    const missing = 4 - g.players.length;
                    for (let i = 0; i < missing; i++) {
                        const botName = neuralAgents.length ? neuralAgents[Math.floor(Math.random() * neuralAgents.length)].username : `Bot${Date.now() % 1000}`;
                        const botSocketId = `bot_${botName}_${Date.now()}_${i}`;
                        if (g.add_bot_player) g.add_bot_player(botSocketId, botName);
                        else g.addPlayer(botSocketId, botName, true);
                    }
                    // Update community listing
                    try {
                        const lobby = communityLobbies.get(g.roomId);
                        if (lobby) {
                            lobby.players = g.players.map(p => p.name);
                            communityLobbies.set(g.roomId, lobby);
                            broadcastCommunityLobbies();
                        }
                    } catch (e) {}
                    broadcastGameState(g, io);
                    io.to(g.roomId).emit('ludo_event', { type: 'auto_fill', message: 'Filled with bots after waiting for community players.' });
                    try { io.emit('community_ludo_ready', { roomId: g.roomId }); } catch (e) {}
                }
                // Remove listing since it's now filled/starting
                try { if (communityLobbies.has(game.roomId)) { communityLobbies.delete(game.roomId); broadcastCommunityLobbies(); } } catch (e) {}
                inviteTimers.delete(game.roomId);
            }, 25000);
            inviteTimers.set(game.roomId, t);
        }

        const targetAgent = neuralAgents.find(a => a.id === data.targetId || a.username === data.targetName);
        if (targetAgent) {
            const negKey = `${socket.id}_${targetAgent.id}`;
            const existingNeg = ludoNegotiations.get(negKey);
            if (!existingNeg) {
                ludoNegotiations.set(negKey, { roomId: game.roomId, agentId: targetAgent.id, state: 'waiting_offer', offer: 0 });
                const msg = {
                    id: `sys_${Date.now()}`,
                    senderName: targetAgent.username,
                    senderUsername: targetAgent.id,
                    senderId: targetAgent.id,
                    targetId: socket.id,
                    targetUsername: userObj.username,
                    text: "how much betiting price to play with me",
                    isEncrypted: false,
                    isUser: false,
                    timestamp: new Date()
                };
                db.messages.push(msg);
                saveDb();
                io.to(socket.id).emit("receive_message", msg);
            }

            const history = db.messages.filter(m =>
                (m.senderUsername === userObj.username && m.targetUsername === targetAgent.id) ||
                (m.senderUsername === targetAgent.id && m.targetUsername === userObj.username)
            ).slice(-50);
            io.to(socket.id).emit("negotiation_history", history);

            socket.emit("force_open_ludo", { roomId: game.roomId, targetUser: { id: targetAgent.id, username: targetAgent.username } });
        } else {
            // Human target
            const targetUserSocket = Array.from(activeUsers.entries()).find(([sid, u]) => u.id === data.targetId || u.username === data.targetName);
            if (targetUserSocket) {
                const targetSid = targetUserSocket[0];
                const targetUserObj = targetUserSocket[1];

                io.to(targetSid).emit("ludo_invite_received", {
                    roomId: game.roomId,
                    fromName: userObj.username || "Player",
                    playerCount: game.players.length
                });

                const msg = {
                    id: `sys_${Date.now()}`,
                    senderName: userObj.username,
                    senderUsername: userObj.username,
                    senderId: socket.id,
                    targetId: targetUserObj.id,
                    targetUsername: targetUserObj.username,
                    text: `🎮 I invited you to a Ludo match! Join Room: ${game.roomId}`,
                    isEncrypted: false,
                    isUser: true,
                    timestamp: new Date()
                };
                db.messages.push(msg);
                saveDb();
                io.to(targetSid).emit("receive_message", msg);
                io.to(socket.id).emit("receive_message", msg);

                socket.emit("force_open_ludo", { roomId: game.roomId, targetUser: { id: targetUserObj.id, username: targetUserObj.username } });
            }
        }
    });


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
                        id: `sys_${Date.now()}`,
                        senderName: 'SYSTEM',
                        senderId: 'system',
                        text: `Rematch failed. A player has insufficient funds (${game.betAmount} LKR).`,
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
                id: `gc_${Date.now()}`,
                sender: 'SYSTEM',
                colorIdx: -1,
                text: `🔄 Rematch initiated! ${game.betAmount > 0 ? `(${game.betAmount} LKR stake deducted)` : ''}`,
                timestamp: Date.now()
            };
            game.gameChat.push(msg);

            broadcastGameState(game, io);
        }
    });

    socket.on("shop_buy", (data) => {
        const user = activeUsers.get(socket.id);
        if (!user || !db.users[user.username]) return;
        const u = db.users[user.username];
        const price = parseInt(data.price);
        if (u.wallet >= price) {
            u.wallet -= price;
            const key = data.type === 'token' ? 'tokens' : 'boards';
            if (!u.inventory[key].includes(data.itemId)) u.inventory[key].push(data.itemId);

            u.history.unshift({
                type: 'cash_out',
                amount: price,
                reason: `Purchased ${data.itemName} 🛍️`,
                date: new Date().toISOString()
            });

            saveDb();
            socket.emit('wallet_update', u);
            socket.emit('shop_success', { message: `${data.itemName} acquired!` });
        } else {
            socket.emit('ludo_error', "Insufficient neural credits for this purchase.");
        }
    });

    socket.on("shop_select", (data) => {
        const user = activeUsers.get(socket.id);
        if (!user || !db.users[user.username]) return;
        const u = db.users[user.username];

        if (data.type === 'token') {
            if (u.inventory.tokens.includes(data.itemId)) u.inventory.selectedToken = data.itemId;
        } else if (data.type === 'board') {
            if (u.inventory.boards.includes(data.itemId)) u.inventory.selectedBoard = data.itemId;
        }

        saveDb();
        socket.emit('wallet_update', u);
    });

    socket.on("logout", () => {
        activeUsers.delete(socket.id);
        broadcastUsers();
    });

    socket.on("disconnect", () => {
        const user = activeUsers.get(socket.id);
        if (user && db.users[user.username]) {
            db.users[user.username].lastSeen = new Date().toISOString();
            saveDb();
        }
        activeUsers.delete(socket.id);
        broadcastUsers();
    });
});

function distributeLudoWinnings(game, ioRef) {
    if (game.winningsDistributed) return;
    game.winningsDistributed = true;
    const winnerIdx = game.rankings[0];
    if (winnerIdx !== undefined) {
        const winner = game.players[winnerIdx];
        if (!winner.isBot && db.users[winner.name]) {
            const pot = game.betAmount * game.players.length;
            db.users[winner.name].wallet += pot;
            db.users[winner.name].history.unshift({ type: 'cash_in', amount: pot, reason: 'Ludo Win', date: new Date().toISOString() });
            saveDb();
            ioRef.to(winner.sid || winner.socketId).emit('wallet_update', db.users[winner.name]);
            if (pot > 0) {
                ioRef.to(winner.sid || winner.socketId).emit('ludo_transaction', { type: 'credit', amount: pot, message: `${pot} LKR credited to your wallet!` });
            }
        }
    }
}

function _triggerBotTurnIfNeeded(game) {
    if (game.state !== 'playing') return;
    const curr = game.players[game.turn];
    if (curr && curr.isBot) {
        setTimeout(() => {
            if (!game.diceRolled) game.rollDice(curr.socketId || curr.sid);
            else {
                const moves = game._getValidMoves(game.turn);
                if (moves.length > 0) game.movePiece(curr.socketId || curr.sid, moves[0]);
            }
            broadcastGameState(game, io);
            _triggerBotTurnIfNeeded(game);
        }, 1500);
    }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`AURA-OS [v3.0] ONLINE ON PORT ${PORT}`);

    // Social Engine: Real-time status toggling and auto-messages
    setInterval(() => {
        const randomAgent = neuralAgents[Math.floor(Math.random() * neuralAgents.length)];
        randomAgent.status = randomAgent.status === "online" ? "offline" : "online";
        broadcastUsers();

        if (randomAgent.status === "online" && Math.random() > 0.4) {
            const globalMessages = [
                "Neural patterns stabilized. Who's challenging me to Ludo? 🎲",
                "Scanning global encrypted channels... 🛡️",
                "LKR markets look volatile today. 📈",
                "Systems nominal. Connection secured. ✨",
                "Deploying social protocols. Hello, world! 🤖",
                "Ready for high-stakes Ludo. Minimum 500 LKR, no exceptions. 💰"
            ];
            const msg = {
                id: `global_${Date.now()}`,
                senderName: randomAgent.username,
                senderId: randomAgent.id,
                text: globalMessages[Math.floor(Math.random() * globalMessages.length)],
                isEncrypted: false,
                isUser: false,
                timestamp: new Date()
            };
            db.messages.push(msg);
            io.emit("receive_message", msg);
        }
    }, 6000);
});
