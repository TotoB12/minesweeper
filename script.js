const rows = 10;
const cols = 10;
const minesCount = 15;
let gameArray = [];
let gameOver = false;

const game = document.getElementById('game');
const messageDiv = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const flagMode = document.getElementById('flagMode');
const flagModeLabel = document.getElementById('flagModeLabel');

restartBtn.addEventListener('click', restartGame);
giveUpBtn.addEventListener('click', giveUpGame);

function init() {
    gameOver = false;
    messageDiv.textContent = '';
    if (flagMode) {
        flagMode.checked = false;
    }
    gameArray = createArray(rows, cols);
    placeMines(gameArray, minesCount);
    calculateNumbers(gameArray);
    renderBoard(gameArray);
    detectMobileDevice();
}

function detectMobileDevice() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) {
        flagModeLabel.style.display = 'inline-block';
    } else {
        flagModeLabel.style.display = 'none';
    }
}

function createArray(rows, cols) {
    let arr = [];
    for (let x = 0; x < rows; x++) {
        arr[x] = [];
        for (let y = 0; y < cols; y++) {
            arr[x][y] = {
                mine: false,
                number: 0,
                revealed: false,
                flagged: false,
                x: x,
                y: y
            };
        }
    }
    return arr;
}

function placeMines(arr, minesCount) {
    let placedMines = 0;
    while (placedMines < minesCount) {
        let x = Math.floor(Math.random() * rows);
        let y = Math.floor(Math.random() * cols);
        if (!arr[x][y].mine) {
            arr[x][y].mine = true;
            placedMines++;
        }
    }
}

function calculateNumbers(arr) {
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            if (arr[x][y].mine) continue;
            let mines = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let xi = x + i;
                    let yj = y + j;
                    if (
                        xi >= 0 &&
                        xi < rows &&
                        yj >= 0 &&
                        yj < cols &&
                        arr[xi][yj].mine
                    ) {
                        mines++;
                    }
                }
            }
            arr[x][y].number = mines;
        }
    }
}

function renderBoard(arr) {
    game.innerHTML = '';
    for (let x = 0; x < rows; x++) {
        let rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        for (let y = 0; y < cols; y++) {
            let cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.x = x;
            cellDiv.dataset.y = y;
            cellDiv.addEventListener('click', handleClick);
            cellDiv.addEventListener('contextmenu', handleRightClick);
            rowDiv.appendChild(cellDiv);
        }
        game.appendChild(rowDiv);
    }
}

function handleClick(e) {
    if (gameOver) return;
    let x = parseInt(e.target.dataset.x);
    let y = parseInt(e.target.dataset.y);
    let cell = gameArray[x][y];

    if (cell.revealed) return;

    if (flagMode && flagMode.checked) {
        // Flagging mode
        toggleFlag(cell, e.target);
    } else {
        if (cell.flagged) return;

        if (cell.mine) {
            revealMines();
            e.target.classList.add('mine');
            displayMessage('Game Over!', 3000);
            gameOver = true;
        } else {
            revealCell(x, y);
            checkWin();
        }
    }
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    let x = parseInt(e.target.dataset.x);
    let y = parseInt(e.target.dataset.y);
    let cell = gameArray[x][y];

    if (cell.revealed) return;

    toggleFlag(cell, e.target);
}

function toggleFlag(cell, cellDiv) {
    cell.flagged = !cell.flagged;
    if (cell.flagged) {
        cellDiv.classList.add('flag');
    } else {
        cellDiv.classList.remove('flag');
    }
}

function revealCell(x, y) {
    let cell = gameArray[x][y];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    let cellDiv = document.querySelector(
        `.cell[data-x='${x}'][data-y='${y}']`
    );
    cellDiv.classList.add('open');
    if (cell.number > 0) {
        cellDiv.textContent = cell.number;
    } else {
        // Reveal adjacent cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let xi = x + i;
                let yj = y + j;
                if (
                    xi >= 0 &&
                    xi < rows &&
                    yj >= 0 &&
                    yj < cols &&
                    !(i === 0 && j === 0)
                ) {
                    revealCell(xi, yj);
                }
            }
        }
    }
}

function revealMines() {
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            let cell = gameArray[x][y];
            let cellDiv = document.querySelector(
                `.cell[data-x='${x}'][data-y='${y}']`
            );
            if (cell.mine) {
                cellDiv.classList.add('mine');
            }
            if (cell.flagged && !cell.mine) {
                cellDiv.classList.add('wrong-flag');
            }
        }
    }
}

function checkWin() {
    let revealedCells = 0;
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            if (gameArray[x][y].revealed) revealedCells++;
        }
    }
    if (revealedCells === rows * cols - minesCount) {
        displayMessage('You Win!', 3000);
        gameOver = true;
    }
}

function displayMessage(msg, duration) {
    messageDiv.textContent = msg;
    if (duration) {
        setTimeout(() => {
            if (!gameOver) {
                messageDiv.textContent = '';
            }
        }, duration);
    }
}

function restartGame() {
    init();
}

function giveUpGame() {
    revealMines();
    displayMessage('You Gave Up!', 3000);
    gameOver = true;
}

init();
