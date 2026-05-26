const fs = require('fs');
let pageContent = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');

pageContent = pageContent.replace(
    `{activeTab === 'survival' && <NeuralGameWorld username={username} onBack={() => { setActiveTab('chat'); setSelectedLudoRoom(null); }} pendingAgents={pendingAgents} initialRoomId={selectedLudoRoom} socket={socket} inventory={walletInfo?.inventory} />}`,
    `{activeTab === 'survival' && <NeuralGameWorld username={username} onBack={() => { setActiveTab('chat'); setSelectedLudoRoom(null); }} pendingAgents={pendingAgents} initialRoomId={selectedLudoRoom} socket={socket} inventory={walletInfo?.inventory} wallet={walletInfo?.wallet} />}`
);

fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', pageContent);
console.log('Passed wallet prop to NeuralGameWorld');
