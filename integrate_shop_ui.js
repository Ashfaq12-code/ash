const fs = require('fs');

let pageContent = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');

// 1. Update activeTab type
pageContent = pageContent.replace(
    "const [activeTab, setActiveTab] = useState<'chat' | 'directory' | 'admin' | 'profile' | 'survival' | 'wallet'>('chat');",
    "const [activeTab, setActiveTab] = useState<'chat' | 'directory' | 'admin' | 'profile' | 'survival' | 'wallet' | 'shop'>('chat');"
);

// 2. Add Shop Button to Sidebar
const sidebarTarget = `title="Neural Wallet"><Wallet /></button>`;
const sidebarNew = `title="Neural Wallet"><Wallet /></button>\n          <button onClick={() => setActiveTab('shop')} className={\`w-12 h-12 rounded-2xl flex items-center justify-center transition-all \${activeTab === 'shop' ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}\`} title="Neural Shop"><Swords /></button>`;
pageContent = pageContent.replace(sidebarTarget, sidebarNew);

// 3. Add ShopPage to Tab Switcher
const tabTarget = `{activeTab === 'survival' && <NeuralGameWorld username={username} onBack={() => { setActiveTab('chat'); setSelectedLudoRoom(null); }} pendingAgents={pendingAgents} initialRoomId={selectedLudoRoom} socket={socket} />}`;
const tabNew = `{activeTab === 'survival' && <NeuralGameWorld username={username} onBack={() => { setActiveTab('chat'); setSelectedLudoRoom(null); }} pendingAgents={pendingAgents} initialRoomId={selectedLudoRoom} socket={socket} inventory={walletInfo?.inventory} />}\n        {activeTab === 'shop' && <ShopPage socket={socket} walletInfo={walletInfo} />}`;
pageContent = pageContent.replace(tabTarget, tabNew);

// 4. Implement ShopPage Component
const shopPageCode = `
function ShopPage({ socket, walletInfo }: { socket: Socket | null, walletInfo: any }) {
  const [activeShopTab, setActiveShopTab] = useState<'tokens' | 'boards'>('tokens');

  const tokens = [
    { id: 'standard', name: 'Standard Unit', price: 0, icon: '⬢', desc: 'Default neural node geometry.' },
    { id: 'sphere', name: 'Neon Sphere', price: 1000, icon: '●', desc: 'High-speed aerodynamic kinetic unit.' },
    { id: 'cube', name: 'Cyber Cube', price: 2500, icon: '■', desc: 'Reinforced block chain geometry.' },
    { id: 'pyramid', name: 'Neural Pyramid', price: 5000, icon: '▲', desc: 'Elite geometric sync structure.' },
  ];

  const boards = [
    { id: 'classic', name: 'Classic Protocol', price: 0, desc: 'Standard AURA-OS grid interface.' },
    { id: 'space', name: 'Deep Space', price: 2000, desc: 'Play on the edge of the neural void.' },
    { id: 'matrix', name: 'Matrix Source', price: 4500, desc: 'Raw binary stream visualization.' },
    { id: 'gold', name: 'Golden Empire', price: 8000, desc: 'Premium executive neural grid.' },
  ];

  const buy = (id: string, price: number, type: string) => {
    socket?.emit('shop_buy', { itemId: id, price, type });
  };

  const equip = (id: string, type: string) => {
    socket?.emit('shop_equip', { itemId: id, type });
  };

  const inventory = walletInfo?.inventory || { tokens: ['standard'], boards: ['classic'], selectedToken: 'standard', selectedBoard: 'classic' };

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#050810] overflow-y-auto selection:bg-emerald-500/30">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">NEURAL SHOP</h1>
          <p className="text-emerald-500 font-mono text-sm tracking-widest uppercase">Upgrade your grid interface</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-right">
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Available Credits</p>
          <p className="text-3xl font-black text-emerald-400">{walletInfo?.wallet || 0} <span className="text-xs">LKR</span></p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveShopTab('tokens')} className={\`px-8 py-3 rounded-xl font-bold transition-all \${activeShopTab === 'tokens' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}\`}>TOKEN SKINS</button>
        <button onClick={() => setActiveShopTab('boards')} className={\`px-8 py-3 rounded-xl font-bold transition-all \${activeShopTab === 'boards' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}\`}>BOARD STYLES</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeShopTab === 'tokens' ? tokens.map(t => {
          const owned = inventory.tokens.includes(t.id);
          const selected = inventory.selectedToken === t.id;
          return (
            <div key={t.id} className={\`bg-[#0c1222] border rounded-3xl p-6 transition-all duration-500 \${selected ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-white/20'}\`}>
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-6">{t.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
              <p className="text-gray-500 text-xs mb-6 h-8">{t.desc}</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                <span className="text-emerald-400 font-bold">{t.price > 0 ? \`\${t.price} LKR\` : 'FREE'}</span>
                {owned ? (
                  <button onClick={() => equip(t.id, 'token')} className={\`px-4 py-2 rounded-lg text-xs font-bold \${selected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}>{selected ? 'EQUIPPED' : 'EQUIP'}</button>
                ) : (
                  <button onClick={() => buy(t.id, t.price, 'token')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg text-xs font-bold transition-all">BUY SKIN</button>
                )}
              </div>
            </div>
          );
        }) : boards.map(b => {
          const owned = inventory.boards.includes(b.id);
          const selected = inventory.selectedBoard === b.id;
          return (
            <div key={b.id} className={\`bg-[#0c1222] border rounded-3xl p-6 transition-all duration-500 \${selected ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-white/20'}\`}>
              <div className={\`w-full h-32 rounded-2xl mb-6 \${b.id==='classic'?'bg-[#162032]':b.id==='space'?'bg-[#0a0a2a]':b.id==='matrix'?'bg-[#001a00]':'bg-[#2a1a00]'}\`}></div>
              <h3 className="text-xl font-bold text-white mb-1">{b.name}</h3>
              <p className="text-gray-500 text-xs mb-6 h-8">{b.desc}</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                <span className="text-emerald-400 font-bold">{b.price > 0 ? \`\${b.price} LKR\` : 'FREE'}</span>
                {owned ? (
                  <button onClick={() => equip(b.id, 'board')} className={\`px-4 py-2 rounded-lg text-xs font-bold \${selected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}>{selected ? 'EQUIPPED' : 'EQUIP'}</button>
                ) : (
                  <button onClick={() => buy(b.id, b.price, 'board')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg text-xs font-bold transition-all">PURCHASE</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`;

pageContent += shopPageCode;

fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', pageContent);
console.log('Shop UI Integrated');
