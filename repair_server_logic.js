const fs = require('fs');

let serverContent = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

const misplacedBlock = `        if (data.targetId && data.targetId.startsWith("agent_")) {
            const negKey = \`\${socket.id}_\${data.targetId}\`;
            const negotiation = ludoNegotiations.get(negKey);
            
            if (negotiation) {
                const text = (data.decryptedTextForAi || data.text || "").toLowerCase();
                const targetAgent = neuralAgents.find(a => a.id === data.targetId);
                
                setTimeout(() => {
                    let aiReply = "";
                    let isReady = false;
                    let amt = 0;
                    
                    if (negotiation.state === 'waiting_offer') {
                        const matches = text.match(/\\d+/g);
                        let offer = matches ? Math.max(...matches.map(Number)) : 0;
                        
                        if (offer < 500) {
                            aiReply = "The stake amount is minimum 500 need to bet.";
                        } else {
                            aiReply = \`Ok I will be ready play game. Are you ready lets start the game?\`;
                            negotiation.state = 'waiting_ready';
                            negotiation.offer = offer;
                            isReady = true;
                            amt = offer;
                        }
                    } else if (negotiation.state === 'waiting_ready') {
                        if (text.includes("yes") || text.includes("ready") || text.includes("start") || text.includes("ok")) {
                            aiReply = "Deploying to the grid.";
                            const game = ludoRooms.get(negotiation.roomId);
                            if (game) {
                                game.betAmount = negotiation.offer;
                                const botSocketId = \`bot_\${Date.now()}_\${Math.random().toString(36).substr(2,4)}\`;
                                game.addPlayer(botSocketId, targetAgent.username, true);
                                broadcastGameState(game, io);
                                io.to(socket.id).emit('agent_joined_game', { agentName: targetAgent.username, roomId: negotiation.roomId });
                                io.to(socket.id).emit('force_open_ludo', { roomId: negotiation.roomId });
                            }
                            ludoNegotiations.delete(negKey);
                        } else {
                            aiReply = "Say 'yes' or 'ready' to start.";
                            isReady = true;
                            amt = negotiation.offer;
                        }
                    }

                    const msgData = {
                        id: \`sys_\${Date.now()}\`,
                        senderName: targetAgent.username,
                        senderId: targetAgent.id,
                        targetId: socket.id,
                        text: aiReply,
                        isLudoReady: isReady,
                        roomId: negotiation.roomId,
                        betAmount: amt,
                        isEncrypted: false,
                        isUser: false,
                        timestamp: new Date()
                    };
                    db.messages.push(msgData);
                    saveDb();
                    io.to(socket.id).emit("receive_message", msgData);
                }, 1000);
                return; // stop normal chat fallback
            }
        }`;

serverContent = serverContent.replace(misplacedBlock, "");

const sendMessageStart = serverContent.indexOf('socket.on("send_message", async (data) => {');
const firstLineOfSendMessage = serverContent.indexOf('{', sendMessageStart) + 1;

const correctBlock = `
        if (data.targetId && data.targetId.startsWith("agent_")) {
            const negKey = \`\${socket.id}_\${data.targetId}\`;
            const negotiation = ludoNegotiations.get(negKey);
            
            if (negotiation) {
                const text = (data.decryptedTextForAi || data.text || "").toLowerCase();
                const targetAgent = neuralAgents.find(a => a.id === data.targetId);
                
                io.to(socket.id).emit("typing_start", { senderId: targetAgent.id, senderName: targetAgent.username });
                
                setTimeout(() => {
                    let aiReply = "";
                    let isReady = false;
                    let negStatus = "negotiating";
                    
                    if (negotiation.state === 'waiting_offer') {
                        const matches = text.match(/\\d+/g);
                        let offer = matches ? Math.max(...matches.map(Number)) : 0;
                        
                        if (offer < 500) {
                            aiReply = \`Stake rejection. \${offer} LKR is insufficient. Neural grid protocols require a minimum 500 LKR stake to initialize a 1v1 session. Please revise your offer.\`;
                            negStatus = "waiting_offer";
                        } else {
                            aiReply = \`Neural patterns synchronized. I accept the \${offer} LKR stake. Grid is prepared. Are you ready? Lets start the game!\`;
                            negotiation.state = 'waiting_ready';
                            negotiation.offer = offer;
                            isReady = true;
                            negStatus = "ready";
                        }
                    } else if (negotiation.state === 'waiting_ready') {
                        if (text.includes("yes") || text.includes("ready") || text.includes("start") || text.includes("ok")) {
                            aiReply = "Authorization granted. Deploying neural link to the grid now...";
                            const game = ludoRooms.get(negotiation.roomId);
                            if (game) {
                                game.betAmount = negotiation.offer;
                                const botSocketId = \`bot_\${Date.now()}_\${Math.random().toString(36).substr(2,4)}\`;
                                game.addPlayer(botSocketId, targetAgent.username, true);
                                broadcastGameState(game, io);
                                io.to(socket.id).emit('agent_joined_game', { agentName: targetAgent.username, roomId: negotiation.roomId, agentId: targetAgent.id });
                                io.to(socket.id).emit('force_open_ludo', { roomId: negotiation.roomId });
                            }
                            ludoNegotiations.delete(negKey);
                            negStatus = "deployed";
                        } else {
                            aiReply = "Waiting for your 'READY' signal to finalize the smart contract.";
                            isReady = true;
                            negStatus = "ready";
                        }
                    }

                    io.to(socket.id).emit("typing_end");

                    const msgData = {
                        id: \`sys_\${Date.now()}\`,
                        senderName: targetAgent.username,
                        senderId: targetAgent.id,
                        targetId: socket.id,
                        text: aiReply,
                        isLudoReady: isReady,
                        negStatus: negStatus,
                        roomId: negotiation.roomId,
                        betAmount: negotiation.offer,
                        isEncrypted: false,
                        isUser: false,
                        timestamp: new Date()
                    };
                    db.messages.push(msgData);
                    saveDb();
                    io.to(socket.id).emit("receive_message", msgData);
                }, 1500);
                return;
            }
        }`;

serverContent = serverContent.slice(0, firstLineOfSendMessage) + correctBlock + serverContent.slice(firstLineOfSendMessage);
fs.writeFileSync('h:\\chatbot\\server\\index.js', serverContent);
console.log('Server Logic Repaired');
