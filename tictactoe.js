let playerX = "X";
let playerO = "O";
let currentPlayer = playerX;
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameCells;
let gameOver = false;
let vsAI = true;
let scores = { X: 0, O: 0, D: 0 };

let winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

window.onload = function () {
    gameCells = document.querySelectorAll(".game-cell");
    gameCells.forEach(cell => cell.addEventListener("click", placeCell));

    document.getElementById("game-restart-button").addEventListener("click", restartGame);
    document.getElementById("btn2p").addEventListener("click", () => setMode(false));
    document.getElementById("btnAI").addEventListener("click", () => setMode(true));

    setStatus("Your turn — X");
};

function setMode(ai) {
    vsAI = ai;
    document.getElementById("btnAI").classList.toggle("active", ai);
    document.getElementById("btn2p").classList.toggle("active", !ai);
    document.getElementById("o-label").textContent = ai ? "O (AI)" : "O (P2)";
    restartGame();
}

function placeCell(event) {
    if (gameOver) return;

    const cellIndex = parseInt(event.target.getAttribute("data-cell-index"));
    if (gameBoard[cellIndex] !== "") return;

    makeMove(cellIndex, currentPlayer);

    const result = checkWin(gameBoard);
    if (result) { endGame(result); return; }

    if (vsAI && currentPlayer === playerX) {
        currentPlayer = playerO;
        setStatus("AI is thinking…");

        setTimeout(() => {
            const aiMove = bestMove(gameBoard);
            if (aiMove !== -1) makeMove(aiMove, playerO);

            const result2 = checkWin(gameBoard);
            if (result2) { endGame(result2); return; }

            currentPlayer = playerX;
            setStatus("Your turn — X");
        }, 250);
    } else {
        currentPlayer = currentPlayer === playerX ? playerO : playerX;
        setStatus(vsAI ? "Your turn — X" : `Player ${currentPlayer}'s turn`);
    }
}

function makeMove(index, player) {
    gameBoard[index] = player;
    gameCells[index].textContent = player;
    gameCells[index].classList.add("taken", player === playerX ? "x-mark" : "o-mark");
}

// ── Minimax with alpha-beta pruning ──────────────────────────────────────────

function checkWin(board) {
    for (let combo of winningCombinations) {
        let [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: combo };
        }
    }
    if (board.every(cell => cell !== "")) return { winner: "draw" };
    return null;
}

function minimax(board, isMaximizing, alpha, beta) {
    const result = checkWin(board);
    if (result) {
        if (result.winner === playerO) return 10;
        if (result.winner === playerX) return -10;
        return 0;
    }

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = playerO;
                best = Math.max(best, minimax(board, false, alpha, beta));
                board[i] = "";
                alpha = Math.max(alpha, best);
                if (beta <= alpha) break;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = playerX;
                best = Math.min(best, minimax(board, true, alpha, beta));
                board[i] = "";
                beta = Math.min(beta, best);
                if (beta <= alpha) break;
            }
        }
        return best;
    }
}

function bestMove(board) {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = playerO;
            let score = minimax(board, false, -Infinity, Infinity);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// ── Game flow ─────────────────────────────────────────────────────────────────

function endGame(result) {
    gameOver = true;
    if (result.winner === "draw") {
        scores.D++;
        document.getElementById("sc-d").textContent = scores.D;
        setStatus("It's a draw!", "draw");
    } else {
        scores[result.winner]++;
        document.getElementById("sc-x").textContent = scores.X;
        document.getElementById("sc-o").textContent = scores.O;

        result.line.forEach(i => gameCells[i].classList.add("winning-game-cell"));

        const msg = vsAI
            ? (result.winner === playerX ? "You win! 🎉" : "AI wins!")
            : `Player ${result.winner} wins!`;
        setStatus(msg, "winner");
    }
}

function restartGame() {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    currentPlayer = playerX;

    gameCells.forEach(cell => {
        cell.textContent = "";
        cell.className = "game-cell";
    });

    setStatus(vsAI ? "Your turn — X" : "Player X's turn");
}

function setStatus(text, cssClass = "") {
    const el = document.getElementById("game-status");
    el.textContent = text;
    el.className = cssClass;
}