import socketio
import aiohttp
from aiohttp import web
import random
import json
import asyncio

sio = socketio.AsyncServer(async_mode='aiohttp', cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

# Ludo Game State
# Players: 0=Red, 1=Green, 2=Yellow, 3=Blue
class LudoGame:
    def __init__(self):
        self.players = [] # [{sid: '...', name: '...', is_bot: bool}, ...] up to 4
        self.pieces = [[-1, -1, -1, -1] for _ in range(4)]
        self.turn = 0 # 0 to 3
        self.state = 'waiting' # waiting, playing, finished
        self.dice = 0
        self.dice_rolled = False
        self.consecutive_sixes = 0

    def add_player(self, sid, name, is_bot=False):
        if len(self.players) < 4 and self.state == 'waiting':
            for p in self.players:
                if p['name'] == name:
                    return False # already joined
            self.players.append({'sid': sid, 'name': name, 'is_bot': is_bot})
            return True
        return False
        
    def start_game(self):
        if len(self.players) >= 2:
            self.state = 'playing'
            self.turn = 0
            self.dice = 0
            self.dice_rolled = False
            self.consecutive_sixes = 0
            
    def roll_dice(self, sid):
        if self.state != 'playing': return False
        if len(self.players) <= self.turn or self.players[self.turn]['sid'] != sid: return False
        if self.dice_rolled: return False
        
        self.dice = random.randint(1, 6)
        self.dice_rolled = True
        
        if self.dice == 6:
            self.consecutive_sixes += 1
            if self.consecutive_sixes == 3:
                # 3 sixes means lose turn
                self.next_turn()
                return True
                
        # Check if any moves are possible
        if not self.has_valid_moves():
            self.next_turn()
            
        return True
        
    def has_valid_moves(self):
        for i in range(4):
            if self.is_valid_move(self.turn, i, self.dice):
                return True
        return False
        
    def is_valid_move(self, player_idx, piece_idx, dice):
        pos = self.pieces[player_idx][piece_idx]
        if pos == -1:
            return dice == 6
        if pos + dice <= 56:
            return True
        return False
        
    def move_piece(self, sid, piece_idx):
        if self.state != 'playing': return False
        if len(self.players) <= self.turn or self.players[self.turn]['sid'] != sid: return False
        if not self.dice_rolled: return False
        
        if not self.is_valid_move(self.turn, piece_idx, self.dice):
            return False
            
        pos = self.pieces[self.turn][piece_idx]
        if pos == -1:
            self.pieces[self.turn][piece_idx] = 0
        else:
            self.pieces[self.turn][piece_idx] += self.dice
            
        # Check captures
        if self.pieces[self.turn][piece_idx] <= 50:
            global_pos = self.get_global_pos(self.turn, self.pieces[self.turn][piece_idx])
            safe_spots = [0, 8, 13, 21, 26, 34, 39, 47]
            if global_pos not in safe_spots:
                for p_idx in range(len(self.players)):
                    if p_idx != self.turn:
                        for idx, p_pos in enumerate(self.pieces[p_idx]):
                            if p_pos != -1 and p_pos <= 50:
                                p_global_pos = self.get_global_pos(p_idx, p_pos)
                                if p_global_pos == global_pos:
                                    # Capture
                                    self.pieces[p_idx][idx] = -1
                                    
        # Check win condition
        win = True
        for p in self.pieces[self.turn]:
            if p != 56: 
                win = False
                break
                
        if win:
            self.state = 'finished'
            return True

        if self.dice != 6:
            self.next_turn()
        else:
            self.dice_rolled = False
            
        return True
        
    def next_turn(self):
        self.turn = (self.turn + 1) % len(self.players)
        self.dice_rolled = False
        self.consecutive_sixes = 0

    def get_global_pos(self, player_idx, rel_pos):
        return (rel_pos + player_idx * 13) % 52
        
    def get_state(self):
        return {
            'players': self.players,
            'pieces': self.pieces,
            'turn': self.turn,
            'state': self.state,
            'dice': self.dice,
            'dice_rolled': self.dice_rolled
        }

game = LudoGame()

@sio.event
async def connect(sid, environ):
    print("connect ", sid)
    await sio.emit('game_update', game.get_state(), to=sid)

@sio.event
async def join_game(sid, data):
    name = data.get('name', 'Unknown')
    is_bot = data.get('is_bot', False)
    if game.add_player(sid, name, is_bot):
        await sio.emit('game_update', game.get_state())
    else:
        await sio.emit('error', {'message': 'Cannot join game'}, to=sid)

@sio.event
async def start_game(sid):
    if len(game.players) >= 2 and game.state == 'waiting':
        game.start_game()
        await sio.emit('game_update', game.get_state())

@sio.event
async def roll_dice(sid):
    if game.roll_dice(sid):
        await sio.emit('game_update', game.get_state())

@sio.event
async def move_piece(sid, data):
    piece_idx = data.get('piece_idx')
    if piece_idx is not None and game.move_piece(sid, piece_idx):
        await sio.emit('game_update', game.get_state())
        
@sio.event
async def reset_game(sid):
    global game
    game = LudoGame()
    await sio.emit('game_update', game.get_state())

@sio.event
async def disconnect(sid):
    print('disconnect ', sid)

async def bot_loop():
    while True:
        await asyncio.sleep(1)
        if game.state == 'playing':
            if game.turn < len(game.players):
                curr_player = game.players[game.turn]
                if curr_player.get('is_bot'):
                    if not game.dice_rolled:
                        await asyncio.sleep(1)
                        if game.roll_dice(curr_player['sid']):
                            await sio.emit('game_update', game.get_state())
                    else:
                        await asyncio.sleep(1)
                        valid_moves = []
                        for i in range(4):
                            if game.is_valid_move(game.turn, i, game.dice):
                                valid_moves.append(i)
                        if valid_moves:
                            piece_idx = random.choice(valid_moves)
                            if game.move_piece(curr_player['sid'], piece_idx):
                                await sio.emit('game_update', game.get_state())

async def init_app():
    asyncio.create_task(bot_loop())
    return app

if __name__ == '__main__':
    web.run_app(init_app(), port=5001)

