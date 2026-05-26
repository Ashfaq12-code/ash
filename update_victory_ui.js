const fs = require('fs');

let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

const buttonsTarget = `<div className="flex gap-4 mt-4">
                  <button onClick={handleReset} className="px-10 py-5 bg-emerald-500 text-black font-black text-xl rounded-2xl flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <RotateCcw className="w-6 h-6" /> REMATCH {gameState.betAmount > 0 ? \`(\${gameState.betAmount} LKR)\` : ''}
                  </button>
                  <button onClick={() => setShowInviteModal(true)} className="px-8 py-5 bg-blue-500/20 text-blue-400 font-black text-xl rounded-2xl flex items-center gap-3 hover:bg-blue-500/40 transition-all"><UserPlus className="w-6 h-6" /> INVITE OTHERS</button>
              </div>`;

const buttonsNew = `<div className="flex flex-col gap-4 mt-4 w-full max-w-md">
                  <button onClick={handleReset} className="w-full py-5 bg-emerald-500 text-black font-black text-xl rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <RotateCcw className="w-6 h-6" /> REMATCH {gameState.betAmount > 0 ? \`(\${gameState.betAmount} LKR)\` : ''}
                  </button>
                  <div className="flex gap-4 w-full">
                      <button onClick={() => setShowInviteModal(true)} className="flex-1 py-4 bg-blue-500/20 text-blue-400 font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500/40 transition-all border border-blue-500/30 uppercase tracking-widest"><UserPlus className="w-4 h-4" /> INVITE</button>
                      <button onClick={onBack} className="flex-1 py-4 bg-white/5 text-gray-400 font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10 uppercase tracking-widest"><LogOut className="w-4 h-4" /> RETURN HOME</button>
                  </div>
              </div>`;

ludoContent = ludoContent.replace(buttonsTarget, buttonsNew);

ludoContent = ludoContent.replace(
    '        setEvents((p: any) => [...p, ev]);',
    '        if (ev.type === \'payout\') { /* special handling */ }\n        setEvents((p: any) => [...p, ev]);'
);

ludoContent = ludoContent.replace(
    '<h3 className="text-amber-400 font-black text-lg uppercase tracking-widest mb-4">MATCH STAKES (LKR)</h3>',
    '<h3 className="text-amber-400 font-black text-lg uppercase tracking-widest mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> MATCH STAKES (LKR)</h3>'
);

fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('UI Updated');
