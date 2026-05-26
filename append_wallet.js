const fs = require('fs');
const content = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');

const walletComponent = `
function WalletPage({ walletInfo, username }: { walletInfo: any, username: string }) {
  const totalIn = walletInfo.history?.filter((h:any) => h.type === 'cash_in').reduce((acc: number, h:any) => acc + h.amount, 0) || 0;
  const totalOut = walletInfo.history?.filter((h:any) => h.type === 'cash_out').reduce((acc: number, h:any) => acc + h.amount, 0) || 0;

  return (
    <div className="flex-1 bg-[#050810] h-screen overflow-y-auto p-8 relative">
      <div className="max-w-5xl mx-auto">
        
        {/* Header section */}
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">Neural Wallet</h1>
                <p className="text-emerald-400 font-mono text-sm tracking-widest">Global Encryption Network</p>
            </div>
            <div className="flex gap-4">
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-sm flex items-center gap-2 border border-white/10">
                    <Zap className="w-4 h-4 text-amber-400" /> BUY LKR
                </button>
            </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/20 border border-amber-500/30 rounded-3xl p-10 mb-8 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <p className="text-amber-500/80 font-mono text-sm uppercase tracking-[0.2em] mb-2">Available Balance</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl md:text-8xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                            {walletInfo.wallet?.toLocaleString()}
                        </span>
                        <span className="text-2xl font-bold text-amber-500/50">LKR</span>
                    </div>
                </div>
                
                <div className="flex gap-8 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-gray-500 text-xs font-mono uppercase mb-1">Total Winnings</p>
                        <p className="text-emerald-400 font-black text-xl">+{totalIn.toLocaleString()}</p>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div>
                        <p className="text-gray-500 text-xs font-mono uppercase mb-1">Total Bets Placed</p>
                        <p className="text-red-400 font-black text-xl">-{totalOut.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* History Section */}
        <div>
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Transaction History</h2>
            <div className="space-y-4">
                {walletInfo.history?.length > 0 ? (
                    walletInfo.history.slice().reverse().map((h: any, i: number) => (
                        <div key={i} className="bg-[#0c1222] border border-white/5 rounded-2xl p-6 flex justify-between items-center hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${h.type === 'cash_in' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}\`}>
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg mb-1">{h.reason}</p>
                                    <p className="text-gray-500 font-mono text-xs">{new Date(h.date).toLocaleDateString()} at {new Date(h.date).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={\`font-black text-2xl \${h.type === 'cash_in' ? 'text-emerald-400' : 'text-red-400'}\`}>
                                    {h.type === 'cash_in' ? '+' : '-'}{h.amount.toLocaleString()} LKR
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                        <Wallet className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-mono">No transaction history found.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', content + "\n" + walletComponent);
