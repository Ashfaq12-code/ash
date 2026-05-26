const fs = require('fs');
let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

ludoContent = ludoContent.replace(
    'inventory?: any;',
    'inventory?: any;\n    wallet?: number;'
);

ludoContent = ludoContent.replace(
    'export default function NeuralGameWorld({ username, onBack, pendingAgents = [], initialRoomId = null, socket, inventory }: NeuralGameWorldProps) {',
    'export default function NeuralGameWorld({ username, onBack, pendingAgents = [], initialRoomId = null, socket, inventory, wallet = 0 }: NeuralGameWorldProps) {'
);

ludoContent = ludoContent.replace(
    '<span className="text-amber-400 font-black text-xl">{inventory?.wallet || 0} LKR</span>',
    '<span className="text-amber-400 font-black text-xl">{wallet || 0} LKR</span>'
);

fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('Fixed wallet display prop');
