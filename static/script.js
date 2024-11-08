const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restart');

let isUserTurn = true;  // To track whose turn it is

cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

restartButton.addEventListener('click', resetGame);

function handleCellClick(cell) {
    if (cell.textContent !== '' || !isUserTurn) return;  // Ignore if already filled or AI's turn

    const cellIndex = cell.getAttribute('data-index');
    cell.textContent = 'X';  // Player's move
    cell.classList.add('x');
    isUserTurn = false;  // Switch to AI's turn

    fetch(`/make_move/${cellIndex}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'win') {
            setTimeout(() => {
                statusDisplay.textContent = `${data.player} wins!`;
                animateWinningLine(data.winningCells);
            }, 500); // Delay to allow the last move to be seen
        } else if (data.status === 'draw') {
            statusDisplay.textContent = 'It\'s a draw!';
        } else {
            updateBoard(data.state);
            isUserTurn = true;  // Switch back to user's turn
        }
    });
}

function animateWinningLine(winningCells) {
    // Create an animated line for the winning combination
    const winningLine = document.createElement('div');
    winningLine.className = 'winning-line';
    document.body.appendChild(winningLine);
    
    const cellRects = winningCells.map(index => cells[index].getBoundingClientRect());
    
    const startX = cellRects[0].left + (cellRects[0].width / 2);
    const startY = cellRects[0].top + (cellRects[0].height / 2);
    const endX = cellRects[2].left + (cellRects[2].width / 2);
    const endY = cellRects[2].top + (cellRects[2].height / 2);
    
    // Position the winning line
    winningLine.style.width = `${Math.abs(endX - startX)}px`;
    winningLine.style.transform = `translate(${Math.min(startX, endX)}px, ${Math.min(startY, endY)}px)`;
    
    // Add a class to trigger the animation
    winningLine.classList.add('show');
    
    // Remove the line after the animation
    setTimeout(() => {
        document.body.removeChild(winningLine);
    }, 1500);
}

function updateBoard(state) {
    cells.forEach((cell, index) => {
        cell.textContent = state[index] === '' ? '' : state[index];
        if (state[index] === 'X') {
            cell.classList.add('x');
        } else if (state[index] === 'O') {
            cell.classList.add('o');
        } else {
            cell.classList.remove('x', 'o');
        }
    });
}

function resetGame() {
    fetch('/reset', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'reset') {
            updateBoard(data.state);
            statusDisplay.textContent = '';
            isUserTurn = true;  // Reset turn to user
        }
    });
}
