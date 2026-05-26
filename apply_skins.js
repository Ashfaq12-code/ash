const fs = require('fs');

let ludoContent = fs.readFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', 'utf8');

// 1. Update Props and State
ludoContent = ludoContent.replace(
    'export default function NeuralGameWorld({ username, onBack, pendingAgents = [], initialRoomId, socket, onNavigateToChat }: any) {',
    'export default function NeuralGameWorld({ username, onBack, pendingAgents = [], initialRoomId, socket, onNavigateToChat, inventory }: any) {'
);

// 2. Update LudoBoard to accept boardSkin
ludoContent = ludoContent.replace(
    'const LudoBoard = () => {',
    'const LudoBoard = ({ boardSkin }: any) => {'
);

ludoContent = ludoContent.replace(
    '<meshStandardMaterial color="#162032" />',
    '<meshStandardMaterial color={boardSkin === "space" ? "#0a0a2a" : boardSkin === "matrix" ? "#001a00" : boardSkin === "gold" ? "#2a1a00" : "#162032"} />'
);

ludoContent = ludoContent.replace(
    '<LudoBoard />',
    '<LudoBoard boardSkin={inventory?.selectedBoard} />'
);

// 3. Update Token to accept skin
ludoContent = ludoContent.replace(
    'const Token = ({ playerIdx, pieceIdx, pos, isMyTurn, onClick, isMine, canMove }: any) => {',
    'const Token = ({ playerIdx, pieceIdx, pos, isMyTurn, onClick, isMine, canMove, skin }: any) => {'
);

const geometryOld = `<mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.4, 1, 32]} />`;

const geometryNew = `<mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                {skin === 'sphere' ? <sphereGeometry args={[0.4, 32, 32]} /> : 
                 skin === 'cube' ? <boxGeometry args={[0.6, 0.6, 0.6]} /> :
                 skin === 'pyramid' ? <coneGeometry args={[0.4, 0.8, 4]} /> :
                 <cylinderGeometry args={[0.3, 0.4, 1, 32]} />
                }`;

ludoContent = ludoContent.replace(geometryOld, geometryNew);

ludoContent = ludoContent.replace(
    '<Token ',
    '<Token skin={inventory?.selectedToken} '
);

fs.writeFileSync('h:\\chatbot\\client\\src\\components\\NeuralGameWorld.tsx', ludoContent);
console.log('Neural Game World Skins Integrated');
