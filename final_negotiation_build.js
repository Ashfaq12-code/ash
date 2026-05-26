const fs = require('fs');

// 1. Update NeuralGameWorld.tsx
let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

// Add state variables
ludoContent = ludoContent.replace(
    '  const [showWalletHistory, setShowWalletHistory] = useState(false);',
    '  const [showWalletHistory, setShowWalletHistory] = useState(false);\n  const [activeNegotiationChat, setActiveNegotiationChat] = useState<string | null>(null);\n  const [activeNegotiationChatName, setActiveNegotiationChatName] = useState("");\n  const [privateMessages, setPrivateMessages] = useState<any[]>([]);\n  const [privateChatInput, setPrivateChatInput] = useState("");'
);

// Add receive_message handler for negotiation
ludoContent = ludoContent.replace(
    `    socket.on('receive_message', (msg: any) => {
        if (!msg.targetId && msg.senderName !== username) {`,
    `    socket.on('receive_message', (msg: any) => {
        // Negotiation Interceptor
        if (msg.senderId && (msg.senderId === activeNegotiationChat || msg.targetId === activeNegotiationChat)) {
            setPrivateMessages(p => [...p, msg]);
        }

        if (!msg.targetId && msg.senderName !== username) {`
);

// Update inviteUser
ludoContent = ludoContent.replace(
    `      setShowInviteModal(false);
      if (onNavigateToChat) {
          onNavigateToChat(targetId);
      }`,
    `      setShowInviteModal(false);
      setActiveNegotiationChat(targetId);
      setActiveNegotiationChatName(targetUser?.username || "Agent");
      setPrivateMessages([]);`
);

// Add sendPrivateChat helper
const helperFuncsPos = ludoContent.indexOf('  const handleCreate = () =>');
const helperFuncs = `  const sendPrivateChat = (text: string, rawText?: string) => {
      if (!socket || !activeNegotiationChat) return;
      const encryptedText = CryptoJS.AES.encrypt(text, "NEURAL_LINK_SECRET").toString();
      socket.emit("send_message", { 
          text: encryptedText, 
          decryptedTextForAi: rawText || text, 
          targetId: activeNegotiationChat 
      });
      setPrivateMessages(p => [...p, { id: Date.now(), senderName: username, text: text, isUser: true, timestamp: new Date() }]);
  };\n\n`;
ludoContent = ludoContent.slice(0, helperFuncsPos) + helperFuncs + ludoContent.slice(helperFuncsPos);

// Add the Overlay JSX
const closingDiv = ludoContent.lastIndexOf('    </div>\n  );\n}');
const overlayJsx = `
        {/* Private Negotiation Overlay */}
        <div className={\`absolute bottom-6 left-6 w-80 bg-[#0c1222]/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 z-50 \${activeNegotiationChat ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}\`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Negotiation: {activeNegotiationChatName}</h3>
                </div>
                <button onClick={() => setActiveNegotiationChat(null)} className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/20">
                {privateMessages.length === 0 && (
                    <div className="text-center py-8 opacity-20">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[9px] font-mono uppercase tracking-widest">Opening Secure Tunnel...</p>
                    </div>
                )}
                {privateMessages.map((m: any, i: number) => (
                    <div key={i} className={\`flex flex-col \${m.senderName === username ? 'items-end' : 'items-start'}\`}>
                        <div className={\`px-3 py-2 rounded-2xl text-xs shadow-lg \${m.senderName === username ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-[#162032] border border-white/5 text-gray-200 rounded-bl-sm'}\`}>
                           {m.text}
                        </div>
                        {m.isLudoReady && (
                            <button 
                                onClick={() => sendPrivateChat("Yes, I am ready. Let's start the game.", "yes")} 
                                className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                            >
                                ✅ ACCEPT & START
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if(privateChatInput.trim()) { sendPrivateChat(privateChatInput); setPrivateChatInput(''); } }} className="flex gap-2">
                <input 
                    type="text" 
                    value={privateChatInput} 
                    onChange={e => setPrivateChatInput(e.target.value)} 
                    placeholder="Enter your offer..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button type="submit" className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all shadow-lg"><Send className="w-4 h-4" /></button>
            </form>
        </div>
`;

ludoContent = ludoContent.slice(0, closingDiv) + overlayJsx + ludoContent.slice(closingDiv);
fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);

// 2. Revert page.tsx back to not navigating
let pageContent = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');
pageContent = pageContent.replace(
    /onNavigateToChat=\{[^}]*\}/,
    ''
);
fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', pageContent);

console.log('Final Build Complete');
