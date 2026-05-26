const fs = require('fs');

let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

ludoContent = ludoContent.replace(
    '<h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 tracking-widest drop-shadow-lg uppercase">Neural Ludo</h1>',
    '<h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 mb-4 tracking-tighter drop-shadow-[0_0_30px_rgba(52,211,153,0.3)] uppercase">NEURAL GRID</h1>'
);

ludoContent = ludoContent.replace(
    '<div className="w-full h-full bg-[#050810] flex flex-col items-center justify-center relative p-6">',
    `<div className="w-full h-full bg-[#050810] flex flex-col items-center justify-center relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse"></div>
              </div>`
);

// Add a more prominent "Return" button that matches the theme
ludoContent = ludoContent.replace(
    '<button onClick={onBack} className="absolute top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><X className="w-6 h-6" /></button>',
    '<button onClick={onBack} className="absolute top-8 left-8 z-50 p-4 rounded-2xl bg-white/5 hover:bg-emerald-500 hover:text-black text-white transition-all border border-white/10 flex items-center gap-2 font-black uppercase text-xs tracking-widest shadow-xl group"><X className="w-5 h-5 group-hover:rotate-90 transition-all" /> EXIT SYSTEM</button>'
);

fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('Ludo UI Enhanced');
