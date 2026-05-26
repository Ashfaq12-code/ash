const fs = require('fs');

// 1. Update server/index.js
let serverContent = fs.readFileSync('h:\\chatbot\\server\\index.js', 'utf8');

// A. Insert ludoNegotiations map
serverContent = serverContent.replace(
    'const activeUsers = new Map();',
    'const activeUsers = new Map();\nconst ludoNegotiations = new Map();'
);

// B. Update ludo_invite_user
serverContent = serverContent.replace(
    `            // Send accept message to the inviter
            io.to(socket.id).emit('receive_message', {
                id: \`sys_\${Date.now()}\`,
                senderName: neuralTarget.username,
                senderId: neuralTarget.id,
                targetId: socket.id,
                text: \`I accept your Ludo invite. Linking my neural patterns to your grid in 3 seconds...\`,
                isEncrypted: false,
                isUser: false,
                timestamp: new Date()
            });

            // Automatically join after 3 seconds
            setTimeout(() => {
                const botSocketId = \`bot_\${Date.now()}_\${Math.random().toString(36).substr(2,4)}\`;
                const result = game.addPlayer(botSocketId, neuralTarget.username, true);
                if (result.error) return;
                
                broadcastGameState(game, io);
                io.to(game.roomId).emit('ludo_player_joined', { name: neuralTarget.username, isBot: true, state: game.serialize() });
                io.to(game.roomId).emit('ludo_event', { type: 'bot_join', message: \`🤖 \${neuralTarget.username} has linked to the grid.\` });
            }, 3000);
            return;`,
    `            // LUDO AI BETTING NEGOTIATION
            const negKey = \`\${socket.id}_\${neuralTarget.id}\`;
            ludoNegotiations.set(negKey, { roomId: game.roomId, agentId: neuralTarget.id, state: 'waiting_offer', offer: 0 });
            
            io.to(socket.id).emit('receive_message', {
                id: \`sys_\${Date.now()}\`,
                senderName: neuralTarget.username,
                senderId: neuralTarget.id,
                targetId: socket.id,
                text: \`I received your Ludo invite. How much betting price to play with me? (Minimum 500 LKR)\`,
                isEncrypted: false,
                isUser: false,
                timestamp: new Date()
            });
            return;`
);

// C. Update send_message
const sendMsgStart = serverContent.indexOf('if (data.targetId) {');
const sendMsgInsert = `
        if (data.targetId && data.targetId.startsWith("agent_")) {
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
        }
`;

serverContent = serverContent.slice(0, sendMsgStart) + sendMsgInsert + "        " + serverContent.slice(sendMsgStart);
fs.writeFileSync('h:\\chatbot\\server\\index.js', serverContent);

// 2. Update client/src/app/page.tsx
let clientContent = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');

clientContent = clientContent.replace(
    '  isImage?: boolean;\n}',
    '  isImage?: boolean;\n  isLudoReady?: boolean;\n  betAmount?: number;\n  roomId?: string;\n}'
);

clientContent = clientContent.replace(
`                    <div className="leading-relaxed break-words">
                      {msg.isImage ? (
                        <img src={msg.text} alt="Shared visual data" className="max-w-full max-h-60 rounded-xl mt-1 border border-white/10" />
                      ) : (
                        msg.text
                      )}
                      {msg.isStreaming && <span className={\`inline-block w-2 h-4 ml-1 animate-pulse \${msg.senderName === "AURA-OS" ? "bg-cyan-400" : "bg-emerald-400"}\`}></span>}
                    </div>
                    <div className={\`text-[9px] font-mono mt-1 opacity-50 flex items-center justify-end gap-1 \${msg.senderName === username ? "text-emerald-100" : "text-gray-400"}\`}>`,
`                    <div className="leading-relaxed break-words">
                      {msg.isImage ? (
                        <img src={msg.text} alt="Shared visual data" className="max-w-full max-h-60 rounded-xl mt-1 border border-white/10" />
                      ) : (
                        msg.text
                      )}
                      {msg.isStreaming && <span className={\`inline-block w-2 h-4 ml-1 animate-pulse \${msg.senderName === "AURA-OS" ? "bg-cyan-400" : "bg-emerald-400"}\`}></span>}
                    </div>
                    {msg.isLudoReady && (
                      <div className="mt-3">
                          <button 
                              onClick={() => {
                                  socket?.emit('send_message', { targetId: msg.senderId, text: "Yes, I am ready.", decryptedTextForAi: "yes" });
                              }}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-[#050810] font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          >
                              <Gamepad2 className="w-4 h-4" /> START THE GAME
                          </button>
                      </div>
                    )}
                    <div className={\`text-[9px] font-mono mt-1 opacity-50 flex items-center justify-end gap-1 \${msg.senderName === username ? "text-emerald-100" : "text-gray-400"}\`}>`
);

fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', clientContent);
