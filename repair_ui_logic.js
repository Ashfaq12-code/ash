const fs = require('fs');

let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

ludoContent = ludoContent.replace(
    'const COLORS = ["#ef4444", "#22c55e", "#eab308", "#3b82f6"];',
    'const COLORS = ["#ef4444", "#22c55e", "#eab308", "#3b82f6"];\nconst SECRET_KEY = "AURA_NEURAL_STRIKE_2024";'
);

ludoContent = ludoContent.replace(
    'const encryptedText = CryptoJS.AES.encrypt(text, "NEURAL_LINK_SECRET").toString();',
    'const encryptedText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();'
);

ludoContent = ludoContent.replace(
    '  const [privateChatInput, setPrivateChatInput] = useState("");',
    '  const [privateChatInput, setPrivateChatInput] = useState("");\n  const [typingStatus, setTypingStatus] = useState<string | null>(null);'
);

ludoContent = ludoContent.replace(
    '    socket.on(\'receive_message\', handleMessage);',
    '    socket.on(\'receive_message\', handleMessage);\n    socket.on(\'typing_start\', (data: any) => { if (data.senderId === activeNegotiationChat) setTypingStatus("Thinking..."); });\n    socket.on(\'typing_end\', () => setTypingStatus(null));'
);

const handleMessageOld = `    const handleMessage = (msg: any) => {
        // Negotiation Interceptor
        if (msg.senderId && (msg.senderId === activeNegotiationChat || msg.targetId === activeNegotiationChat)) {
            setPrivateMessages(p => [...p, msg]);
        }
        // Global Broadcast fallback
        if (!msg.targetId && msg.senderName !== username) {
            setGlobalMessages((p: any) => {
               const newMsgs = [...p, msg];
               if (newMsgs.length > 5) return newMsgs.slice(newMsgs.length - 5);
               return newMsgs;
            });
            setShowGlobalChat(true);
        }
    };`;

const handleMessageNew = `    const handleMessage = (msg: any) => {
        if (msg.senderId && (msg.senderId === activeNegotiationChat || msg.targetId === activeNegotiationChat)) {
            let dec = msg.text;
            if (msg.isEncrypted) {
                try {
                    const bytes = CryptoJS.AES.decrypt(msg.text, SECRET_KEY);
                    dec = bytes.toString(CryptoJS.enc.Utf8);
                } catch (e) {}
            }
            setPrivateMessages(p => [...p, { ...msg, text: dec }]);
        }
        if (!msg.targetId && msg.senderName !== username) {
            setGlobalMessages((p: any) => {
               const newMsgs = [...p, msg];
               if (newMsgs.length > 5) return newMsgs.slice(newMsgs.length - 5);
               return newMsgs;
            });
            setShowGlobalChat(true);
        }
    };`;

ludoContent = ludoContent.replace(handleMessageOld, handleMessageNew);

const overlayJsxTarget = `                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Negotiation: {activeNegotiationChatName}</h3>
                </div>`;

const overlayJsxNew = `                <div className="flex items-center gap-2">
                    <div className={\`w-2 h-2 rounded-full animate-pulse \${
                        privateMessages.slice(-1)[0]?.negStatus === 'ready' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                        privateMessages.slice(-1)[0]?.negStatus === 'waiting_offer' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                        'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                    }\`}></div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        {activeNegotiationChatName} 
                        <span className="ml-2 opacity-50 font-mono">
                            {privateMessages.slice(-1)[0]?.negStatus === 'ready' ? '[READY]' : 
                             privateMessages.slice(-1)[0]?.negStatus === 'waiting_offer' ? '[WAITING OFFER]' : 
                             '[NEGOTIATING]'}
                        </span>
                    </h3>
                </div>`;

ludoContent = ludoContent.replace(overlayJsxTarget, overlayJsxNew);

ludoContent = ludoContent.replace(
    '{privateMessages.map((m: any, i: number) => (',
    '{typingStatus && <div className="text-[9px] font-mono text-emerald-500 animate-pulse mb-2 uppercase tracking-widest">>> {activeNegotiationChatName} is thinking...</div>}\n                {privateMessages.map((m: any, i: number) => ('
);

fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('UI Repaired');
