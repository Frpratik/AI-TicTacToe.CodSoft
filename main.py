from flask import Flask, render_template, jsonify, request
import numpy as np

app = Flask(__name__)

# Constants for players
PLAYER_X = 'X'
PLAYER_O = 'O'
EMPTY = ''

# Game state
game_state = np.full(9, EMPTY)  # 3x3 board flattened into a 1D array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/make_move/<int:index>', methods=['POST'])
def make_move(index):
    global game_state
    if game_state[index] == EMPTY:
        game_state[index] = PLAYER_X  # Human player's move
        if check_winner(PLAYER_X):
            return jsonify({'status': 'win', 'player': PLAYER_X})

        if is_draw():
            return jsonify({'status': 'draw'})

        ai_move()  # AI makes its move
        if check_winner(PLAYER_O):
            return jsonify({'status': 'win', 'player': PLAYER_O})

        if is_draw():
            return jsonify({'status': 'draw'})

    return jsonify({'status': 'continue', 'state': game_state.tolist()})

def ai_move():
    best_move = find_best_move()
    if best_move is not None:
        game_state[best_move] = PLAYER_O

def find_best_move():
    best_score = -np.inf
    move = None
    for i in range(9):
        if game_state[i] == EMPTY:
            game_state[i] = PLAYER_O
            score = minimax(game_state, 0, False)
            game_state[i] = EMPTY
            if score > best_score:
                best_score = score
                move = i
    return move

def minimax(board, depth, is_maximizing):
    if check_winner(PLAYER_O):
        return 1
    if check_winner(PLAYER_X):
        return -1
    if is_draw():
        return 0

    if is_maximizing:
        best_score = -np.inf
        for i in range(9):
            if board[i] == EMPTY:
                board[i] = PLAYER_O
                score = minimax(board, depth + 1, False)
                board[i] = EMPTY
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = np.inf
        for i in range(9):
            if board[i] == EMPTY:
                board[i] = PLAYER_X
                score = minimax(board, depth + 1, True)
                board[i] = EMPTY
                best_score = min(score, best_score)
        return best_score

def check_winner(player):
    win_conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]
    return any(all(game_state[i] == player for i in condition) for condition in win_conditions)

def is_draw():
    return all(cell != EMPTY for cell in game_state)

@app.route('/reset', methods=['POST'])
def reset_game():
    global game_state
    game_state = np.full(9, EMPTY)
    return jsonify({'status': 'reset', 'state': game_state.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
