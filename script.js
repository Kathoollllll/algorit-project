window.addEventListener('DOMContentLoaded', () => {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    let boardSize = tiles.length; 
    let board = Array(boardSize).fill('');
    let bigBoard = boardSize === 81 ? Array(9).fill('') : null; 
    let currentPlayer = 'X';
    let isGameActive = true;
    let nextGrid = null; 

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

    const winningConditions3x3 = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const winningConditions4x4 = [
        [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
        [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
        [0, 5, 10, 15], [3, 6, 9, 12]
    ];

    const winningConditionsUltimate = winningConditions3x3; 

    function checkSmallGridWinner(gridIndex) {
        if (boardSize !== 81) return '';

        let start = gridIndex * 9;
        let smallGrid = board.slice(start, start + 9);

        for (let condition of winningConditions3x3) {
            let values = condition.map(index => smallGrid[index]);
            if (!values.includes('') && new Set(values).size === 1) {
                return values[0]; 
            }
        }

        return smallGrid.includes('') ? '' : 'TIE';
    }

    function handleResultValidation() {
        if (boardSize === 9) {
            validateWin(winningConditions3x3);
        } else if (boardSize === 16) {
            validateWin(winningConditions4x4);
        } else if (boardSize === 81) {
            handleUltimateValidation();
        }
    }

    function validateWin(conditions) {
        let roundWon = false;
        for (let condition of conditions) {
            let values = condition.map(index => board[index]);
            if (!values.includes('') && new Set(values).size === 1) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
        } else if (!board.includes('')) {
            announce(TIE);
        }
    }

    function handleUltimateValidation() {
        for (let i = 0; i < 9; i++) {
            if (bigBoard[i] === '') {
                let winner = checkSmallGridWinner(i);
                if (winner) bigBoard[i] = winner;
            }
        }

        for (let condition of winningConditionsUltimate) {
            let values = condition.map(index => bigBoard[index]);
            if (!values.includes('') && new Set(values).size === 1) {
                announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
                isGameActive = false;
                return;
            }
        }

        if (!bigBoard.includes('')) announce(TIE);
    }

    function announce(type) {
        switch (type) {
            case PLAYERO_WON:
                announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                break;
            case TIE:
                announcer.innerText = 'Tie';
        }
        announcer.classList.remove('hide');
    }

    function isValidAction(index) {
        let gridIndex = boardSize === 81 ? Math.floor(index / 9) : null;

        if (boardSize === 81) {
            if (nextGrid !== null && gridIndex !== nextGrid && bigBoard[nextGrid] === '') {
                return false; // Must play in correct mini-board
            }
            return board[index] === '' && bigBoard[gridIndex] === '';
        } else {
            return board[index] === '';
        }
    }

    function updateBoard(index) {
        board[index] = currentPlayer;

        if (boardSize === 81) {
            let gridIndex = Math.floor(index / 9);
            let cellIndex = index % 9;

            let winner = checkSmallGridWinner(gridIndex);
            if (winner) bigBoard[gridIndex] = winner;

            nextGrid = bigBoard[cellIndex] === '' ? cellIndex : null;
        }
    }

    function changePlayer() {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);
    }

    function userAction(tile, index) {
        if (isValidAction(index) && isGameActive) {
            tile.innerText = currentPlayer;
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(index);
            handleResultValidation();
            changePlayer();
        }
    }

    function resetBoard() {
        board = Array(boardSize).fill('');
        if (boardSize === 81) {
            bigBoard = Array(9).fill('');
            nextGrid = null;
        }
        isGameActive = true;
        announcer.classList.add('hide');

        if (currentPlayer === 'O') changePlayer();

        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX', 'playerO');
        });
    }

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });

    resetButton.addEventListener('click', resetBoard);
});
