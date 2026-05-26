const fs = require('fs');
let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

const walletWidgetHTML = `
                <div className="absolute top-8 right-8 z-50">
                    <div className="bg-[#0c1222] border border-amber-500/30 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <span className="text-gray-500 text-xs font-mono uppercase tracking-widest">WALLET</span>
                        <span className="text-amber-400 font-black text-xl">{inventory?.wallet || 0} LKR</span>
                    </div>
                </div>
`;

ludoContent = ludoContent.replace(
    '<button onClick={onBack} className="absolute top-8 left-8 z-50 p-4 rounded-2xl bg-white/5 hover:bg-emerald-500 hover:text-black text-white transition-all border border-white/10 flex items-center gap-2 font-black uppercase text-xs tracking-widest shadow-xl group"><X className="w-5 h-5 group-hover:rotate-90 transition-all" /> EXIT SYSTEM</button>',
    `<button onClick={onBack} className="absolute top-8 left-8 z-50 p-4 rounded-2xl bg-white/5 hover:bg-emerald-500 hover:text-black text-white transition-all border border-white/10 flex items-center gap-2 font-black uppercase text-xs tracking-widest shadow-xl group"><X className="w-5 h-5 group-hover:rotate-90 transition-all" /> EXIT SYSTEM</button>${walletWidgetHTML}`
);

fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('Wallet added to lobby');
