const fs = require('fs');

let pageContent = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');
pageContent = pageContent.replace(
    `{activeTab === 'survival' && <NeuralGameWorld username={username} onBack={() => { setActiveTab('chat'); setSelectedLudoRoom(null); }} pendingAgents={pendingAgents} initialRoomId={selectedLudoRoom} socket={socket} />}`,
    `{activeTab === 'survival' && <NeuralGameWorld username={username} onBack={() => { setActiveTab('chat'); setSelectedLudoRoom(null); }} pendingAgents={pendingAgents} initialRoomId={selectedLudoRoom} socket={socket} onNavigateToChat={(id: string) => { setSelectedChatId(id); setActiveTab('chat'); setToast({ id: 'sys_invite', name: 'AURA-OS', text: 'Invite sent successfully!' }); setTimeout(() => setToast(null), 3000); }} />}`
);
fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', pageContent);

let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');
ludoContent = ludoContent.replace(
    `export default function NeuralGameWorld({ username, onBack, pendingAgents = [], initialRoomId, socket }: any) {`,
    `export default function NeuralGameWorld({ username, onBack, pendingAgents = [], initialRoomId, socket, onNavigateToChat }: any) {`
);

const inviteFunctionTarget = `  const inviteUser = (targetId: string) => {
      if (gameState?.players?.length >= 4) {
          setEvents(p => [...p, { message: "⚠️ Room is full (4/4 players)!", isError: true }]);
          setTimeout(() => setEvents(p => p.slice(1)), 3000);
          return;
      }
      socket?.emit('ludo_invite_user', { targetSocketId: targetId });
      setEvents(p => [...p, { message: "Invite sent successfully!" }]);
      setTimeout(() => setEvents(p => p.slice(1)), 3000);

      const targetUser = onlineUsers.find(u => u.id === targetId);
      if (targetUser && !sentInvites.find(i => i.id === targetId)) {
          setSentInvites(p => [...p, targetUser]);
      }
      setShowInviteModal(false);
  };`;

const newInviteFunction = `  const inviteUser = (targetId: string) => {
      if (gameState?.players?.length >= 4) {
          setEvents(p => [...p, { message: "⚠️ Room is full (4/4 players)!", isError: true }]);
          setTimeout(() => setEvents(p => p.slice(1)), 3000);
          return;
      }
      socket?.emit('ludo_invite_user', { targetSocketId: targetId });

      const targetUser = onlineUsers.find(u => u.id === targetId);
      if (targetUser && !sentInvites.find(i => i.id === targetId)) {
          setSentInvites(p => [...p, targetUser]);
      }
      setShowInviteModal(false);
      if (onNavigateToChat) {
          onNavigateToChat(targetId);
      }
  };`;

ludoContent = ludoContent.replace(inviteFunctionTarget, newInviteFunction);
fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('Fixed');
