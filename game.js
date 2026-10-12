// Tic Tac Toe Core Game Engine & Minimax AI
class TicTacToeEngine {
    constructor() {
        this.size = 3;
        this.winCondition = 3;
        this.board = [];
        this.currentPlayer = 'X';
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.mode = 'ai'; // 'ai' or 'pvp'
        this.difficulty = 'impossible'; // 'easy', 'medium', 'impossible'
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.moveHistory = [];
        this.winLinesList = [];

        this.scores = this.loadScores();
        this.resetGame();
    }

    loadScores() {
        const saved = localStorage.getItem('ttt_scores_v2');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(e);
            }
        }
        return {
            xWins: 0,
            oWins: 0,
            ties: 0,
            currentStreak: 0,
            streakHolder: null,
            bestStreak: 0
        };
    }

    saveScores() {
        localStorage.setItem('ttt_scores_v2', JSON.stringify(this.scores));
    }

    resetScores() {
        this.scores = {
            xWins: 0,
            oWins: 0,
            ties: 0,
            currentStreak: 0,
            streakHolder: null,
            bestStreak: 0
        };
        this.saveScores();
    }

    setBoardSize(size) {
        this.size = parseInt(size, 10);
        // Win condition: 3 for 3x3, 4 for 4x4 and 5x5
        this.winCondition = this.size === 3 ? 3 : 4;
        this.generateWinLines();
        this.resetGame();
    }

    generateWinLines() {
        const s = this.size;
        const target = this.winCondition;
        const lines = [];

        // Rows
        for (let r = 0; r < s; r++) {
            for (let c = 0; c <= s - target; c++) {
                const line = [];
                for (let k = 0; k < target; k++) {
                    line.push(r * s + (c + k));
                }
                lines.push(line);
            }
        }

        // Columns
        for (let c = 0; c < s; c++) {
            for (let r = 0; r <= s - target; r++) {
                const line = [];
                for (let k = 0; k < target; k++) {
                    line.push((r + k) * s + c);
                }
                lines.push(line);
            }
        }

        // Main Diagonals (\)
        for (let r = 0; r <= s - target; r++) {
            for (let c = 0; c <= s - target; c++) {
                const line = [];
                for (let k = 0; k < target; k++) {
                    line.push((r + k) * s + (c + k));
                }
                lines.push(line);
            }
        }

        // Anti Diagonals (/)
        for (let r = 0; r <= s - target; r++) {
            for (let c = target - 1; c < s; c++) {
                const line = [];
                for (let k = 0; k < target; k++) {
                    line.push((r + k) * s + (c - k));
                }
                lines.push(line);
            }
        }

        this.winLinesList = lines;
    }

    resetGame(starter = 'X') {
        const totalCells = this.size * this.size;
        this.board = Array(totalCells).fill(null);
        this.currentPlayer = starter;
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.moveHistory = [];
        this.generateWinLines();
    }

    makeMove(index) {
        if (this.isGameOver || this.board[index] !== null) {
            return false;
        }

        const player = this.currentPlayer;
        this.board[index] = player;
        this.moveHistory.push({
            index,
            player,
            boardSnapshot: [...this.board]
        });

        // Check for win
        const win = this.checkWin(this.board);
        if (win) {
            this.isGameOver = true;
            this.winner = win.player;
            this.winningLine = win.line;
            this.updateStatsOnGameOver(this.winner);
            return {
                success: true,
                gameOver: true,
                winner: this.winner,
                winningLine: this.winningLine
            };
        }

        // Check for draw
        if (this.isBoardFull(this.board)) {
            this.isGameOver = true;
            this.winner = 'draw';
            this.winningLine = null;
            this.updateStatsOnGameOver('draw');
            return {
                success: true,
                gameOver: true,
                winner: 'draw',
                winningLine: null
            };
        }

        // Toggle turn
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return {
            success: true,
            gameOver: false,
            nextPlayer: this.currentPlayer
        };
    }

    updateStatsOnGameOver(winner) {
        if (winner === 'draw') {
            this.scores.ties++;
            this.scores.currentStreak = 0;
            this.scores.streakHolder = null;
        } else if (winner === 'X') {
            this.scores.xWins++;
            if (this.scores.streakHolder === 'X') {
                this.scores.currentStreak++;
            } else {
                this.scores.streakHolder = 'X';
                this.scores.currentStreak = 1;
            }
        } else if (winner === 'O') {
            this.scores.oWins++;
            if (this.scores.streakHolder === 'O') {
                this.scores.currentStreak++;
            } else {
                this.scores.streakHolder = 'O';
                this.scores.currentStreak = 1;
            }
        }

        if (this.scores.currentStreak > this.scores.bestStreak) {
            this.scores.bestStreak = this.scores.currentStreak;
        }
        this.saveScores();
    }

    isBoardFull(board) {
        return board.every(cell => cell !== null);
    }

    getAvailableMoves(board = this.board) {
        const moves = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) moves.push(i);
        }
        return moves;
    }

    checkWin(board = this.board) {
        for (const line of this.winLinesList) {
            const first = board[line[0]];
            if (first !== null) {
                let match = true;
                for (let i = 1; i < line.length; i++) {
                    if (board[line[i]] !== first) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return { player: first, line };
                }
            }
        }
        return null;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;

        // If in AI mode and it's player's turn, undo both AI and player moves
        if (this.mode === 'ai') {
            if (this.isGameOver) {
                // Game ended, undo the last 1 or 2 moves depending on who finished
                const lastMove = this.moveHistory.pop();
                if (lastMove.player === this.aiPlayer && this.moveHistory.length > 0) {
                    this.moveHistory.pop();
                }
            } else if (this.currentPlayer === this.humanPlayer && this.moveHistory.length >= 2) {
                this.moveHistory.pop(); // AI's move
                this.moveHistory.pop(); // Human's move
            } else {
                this.moveHistory.pop();
            }
        } else {
            // PvP mode: undo single move
            this.moveHistory.pop();
        }

        // Reconstruct board from last snapshot or empty
        const totalCells = this.size * this.size;
        if (this.moveHistory.length === 0) {
            this.board = Array(totalCells).fill(null);
            this.currentPlayer = 'X';
        } else {
            const lastState = this.moveHistory[this.moveHistory.length - 1];
            this.board = [...lastState.boardSnapshot];
            this.currentPlayer = lastState.player === 'X' ? 'O' : 'X';
        }

        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        return true;
    }

    // AI Decision System
    getAIMove() {
        const availableMoves = this.getAvailableMoves();
        if (availableMoves.length === 0) return null;

        if (this.difficulty === 'easy') {
            // Easy: 75% random, 25% tactical
            if (Math.random() > 0.25) {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            return this.findTacticalMove() || availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        if (this.difficulty === 'medium') {
            // Medium: always blocks or wins immediately, otherwise 50% random / strategic
            const quickWin = this.findImmediateWinOrBlock(this.aiPlayer);
            if (quickWin !== null) return quickWin;

            const blockLoss = this.findImmediateWinOrBlock(this.humanPlayer);
            if (blockLoss !== null) return blockLoss;

            if (Math.random() > 0.4) {
                return this.findTacticalMove() || availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // Impossible: Unbeatable Minimax
        if (this.size === 3) {
            return this.getMinimaxMove3x3();
        } else {
            return this.getSmartHeuristicMove();
        }
    }

    findImmediateWinOrBlock(player) {
        const moves = this.getAvailableMoves();
        for (const idx of moves) {
            this.board[idx] = player;
            const win = this.checkWin(this.board);
            this.board[idx] = null;
            if (win) return idx;
        }
        return null;
    }

    findTacticalMove() {
        // Prefer center or corners
        const center = Math.floor((this.size * this.size) / 2);
        if (this.board[center] === null) return center;

        const corners = [0, this.size - 1, this.size * (this.size - 1), this.size * this.size - 1];
        const openCorners = corners.filter(c => this.board[c] === null);
        if (openCorners.length > 0) {
            return openCorners[Math.floor(Math.random() * openCorners.length)];
        }
        return null;
    }

    getMinimaxMove3x3() {
        // If board is empty, picking center or corner is fastest and optimal
        const available = this.getAvailableMoves();
        if (available.length === 9) {
            const openers = [0, 2, 4, 6, 8];
            return openers[Math.floor(Math.random() * openers.length)];
        }
        if (available.length === 8 && this.board[4] === null) {
            return 4; // Take center if open
        }

        let bestScore = -Infinity;
        let bestMove = available[0];

        for (const move of available) {
            this.board[move] = this.aiPlayer;
            const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
            this.board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        const win = this.checkWin(board);
        if (win) {
            if (win.player === this.aiPlayer) return 10 - depth;
            if (win.player === this.humanPlayer) return depth - 10;
        }
        if (this.isBoardFull(board)) return 0;

        const available = this.getAvailableMoves(board);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of available) {
                board[move] = this.aiPlayer;
                const evaluation = this.minimax(board, depth + 1, false, alpha, beta);
                board[move] = null;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break; // Alpha-beta prune
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of available) {
                board[move] = this.humanPlayer;
                const evaluation = this.minimax(board, depth + 1, true, alpha, beta);
                board[move] = null;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break; // Alpha-beta prune
            }
            return minEval;
        }
    }

    getSmartHeuristicMove() {
        // Fast depth-limited alpha-beta minimax with heuristic evaluation for 4x4 / 5x5
        const available = this.getAvailableMoves();

        // Check instant win
        const winMove = this.findImmediateWinOrBlock(this.aiPlayer);
        if (winMove !== null) return winMove;

        // Check instant block
        const blockMove = this.findImmediateWinOrBlock(this.humanPlayer);
        if (blockMove !== null) return blockMove;

        // Evaluate top moves using heuristic search
        let bestScore = -Infinity;
        let bestMove = available[0];
        const maxDepth = this.size === 4 ? 3 : 2;

        for (const move of available) {
            this.board[move] = this.aiPlayer;
            const score = this.minimaxHeuristic(this.board, 1, maxDepth, false, -Infinity, Infinity);
            this.board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimaxHeuristic(board, depth, maxDepth, isMaximizing, alpha, beta) {
        const win = this.checkWin(board);
        if (win) {
            if (win.player === this.aiPlayer) return 1000 - depth * 10;
            if (win.player === this.humanPlayer) return depth * 10 - 1000;
        }
        if (this.isBoardFull(board) || depth >= maxDepth) {
            return this.evaluateBoardHeuristic(board);
        }

        const available = this.getAvailableMoves(board);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of available) {
                board[move] = this.aiPlayer;
                const evaluation = this.minimaxHeuristic(board, depth + 1, maxDepth, false, alpha, beta);
                board[move] = null;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of available) {
                board[move] = this.humanPlayer;
                const evaluation = this.minimaxHeuristic(board, depth + 1, maxDepth, true, alpha, beta);
                board[move] = null;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluateBoardHeuristic(board) {
        let score = 0;
        for (const line of this.winLinesList) {
            let aiCount = 0;
            let humanCount = 0;
            for (const idx of line) {
                if (board[idx] === this.aiPlayer) aiCount++;
                else if (board[idx] === this.humanPlayer) humanCount++;
            }

            if (aiCount > 0 && humanCount === 0) {
                score += Math.pow(10, aiCount);
            } else if (humanCount > 0 && aiCount === 0) {
                score -= Math.pow(10, humanCount);
            }
        }
        return score;
    }
}

window.TicTacToeEngine = TicTacToeEngine;
