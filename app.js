// UI Controller & Orchestration
document.addEventListener('DOMContentLoaded', () => {
    // Instantiate game engine
    const game = new window.TicTacToeEngine();
    const sound = window.soundCtrl;
    const confetti = window.confettiEngine;

    // DOM Elements
    const boardGrid = document.getElementById('board-grid');
    const strikeSvg = document.getElementById('strike-canvas');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const statusText = document.getElementById('status-text');
    const turnDot = document.getElementById('turn-pulse-dot');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreTies = document.getElementById('score-ties');
    const streakCount = document.getElementById('streak-count');
    const btnRestart = document.getElementById('btn-restart');
    const btnUndo = document.getElementById('btn-undo');
    const btnReplay = document.getElementById('btn-replay');
    const btnSound = document.getElementById('btn-sound');
    const btnTheme = document.getElementById('btn-theme');
    const btnResetStats = document.getElementById('btn-reset-stats');
    const themeModal = document.getElementById('theme-modal');
    const modalClose = document.getElementById('modal-close');
    const playerOName = document.getElementById('player-o-name');

    // Controls
    const modeBtns = document.querySelectorAll('[data-mode]');
    const diffBtns = document.querySelectorAll('[data-diff]');
    const sizeBtns = document.querySelectorAll('[data-size]');
    const diffControl = document.getElementById('diff-control');

    // Initialize confetti
    confetti.init(confettiCanvas);

    // Audio UI sync
    updateSoundButtonIcon();

    // Theme Management
    const savedTheme = localStorage.getItem('ttt_theme') || 'cyber-neon';
    setTheme(savedTheme);

    function setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('ttt_theme', themeName);

        document.querySelectorAll('.theme-option').forEach(opt => {
            if (opt.getAttribute('data-theme-choice') === themeName) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    // Render Board
    function renderBoard() {
        boardGrid.className = `board-grid size-${game.size}`;
        boardGrid.innerHTML = '';
        clearWinningLaser();

        const totalCells = game.size * game.size;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.setAttribute('data-index', i);
            cell.setAttribute('aria-label', `Cell ${i + 1}`);

            const mark = game.board[i];
            if (mark) {
                cell.classList.add('filled');
                cell.innerHTML = getMarkSvg(mark);
            }

            cell.addEventListener('click', () => handleCellClick(i));
            boardGrid.appendChild(cell);
        }

        updateTurnIndicator();
        updateScoreboard();
        updateUndoButton();
    }

    // Generate Mark SVGs
    function getMarkSvg(type) {
        if (type === 'X') {
            return `
                <svg viewBox="0 0 100 100" class="mark-x">
                    <line x1="20" y1="20" x2="80" y2="80" />
                    <line x1="80" y1="20" x2="20" y2="80" />
                </svg>
            `;
        } else {
            return `
                <svg viewBox="0 0 100 100" class="mark-o">
                    <circle cx="50" cy="50" r="34" />
                </svg>
            `;
        }
    }

    // Handle Cell Click
    let isAiThinking = false;

    function handleCellClick(index) {
        if (game.isGameOver || isAiThinking) return;
        if (game.board[index] !== null) return;

        // Player Move
        const player = game.currentPlayer;
        const result = game.makeMove(index);
        if (!result.success) return;

        sound.playMove(player);
        updateCellUI(index, player);

        if (result.gameOver) {
            handleGameOver(result);
            return;
        }

        updateTurnIndicator();
        updateUndoButton();

        // AI Turn
        if (game.mode === 'ai' && game.currentPlayer === game.aiPlayer) {
            isAiThinking = true;
            statusText.textContent = 'CyberBot thinking...';
            boardGrid.classList.add('disabled-pointer');

            setTimeout(() => {
                const aiIndex = game.getAIMove();
                if (aiIndex !== null && !game.isGameOver) {
                    const aiResult = game.makeMove(aiIndex);
                    if (aiResult.success) {
                        sound.playMove(game.aiPlayer);
                        updateCellUI(aiIndex, game.aiPlayer);

                        if (aiResult.gameOver) {
                            handleGameOver(aiResult);
                        } else {
                            updateTurnIndicator();
                        }
                    }
                }
                isAiThinking = false;
                boardGrid.classList.remove('disabled-pointer');
                updateUndoButton();
            }, 360 + Math.random() * 150);
        }
    }

    function updateCellUI(index, player) {
        const cell = boardGrid.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.classList.add('filled');
            cell.innerHTML = getMarkSvg(player);
        }
    }

    function handleGameOver(result) {
        updateScoreboard();
        updateUndoButton();
        btnReplay.disabled = false;

        if (result.winner === 'draw') {
            sound.playDraw();
            statusText.textContent = "🤝 It's a Draw!";
            turnDot.className = 'turn-pulse-dot';
            turnDot.style.background = 'var(--text-muted)';
            turnDot.style.boxShadow = 'none';
        } else {
            sound.playWin();
            const winnerName = (game.mode === 'ai' && result.winner === 'O') ? 'CyberBot' : `Player ${result.winner}`;
            statusText.textContent = `🎉 ${winnerName} Wins!`;

            // Draw laser strike line
            if (result.winningLine) {
                drawWinningLaser(result.winningLine, result.winner);
                highlightWinningCells(result.winningLine);
            }

            // Confetti
            const pColor = result.winner === 'X' ? 'var(--color-x)' : 'var(--color-o)';
            confetti.trigger(pColor, '#ffd700');
        }
    }

    // Winning Laser Beam Calculation
    function drawWinningLaser(lineIndices, winner) {
        if (!lineIndices || lineIndices.length < 2) return;

        const firstCell = boardGrid.querySelector(`[data-index="${lineIndices[0]}"]`);
        const lastCell = boardGrid.querySelector(`[data-index="${lineIndices[lineIndices.length - 1]}"]`);
        if (!firstCell || !lastCell) return;

        const boardRect = boardGrid.getBoundingClientRect();
        const firstRect = firstCell.getBoundingClientRect();
        const lastRect = lastCell.getBoundingClientRect();

        let x1 = firstRect.left + firstRect.width / 2 - boardRect.left;
        let y1 = firstRect.top + firstRect.height / 2 - boardRect.top;
        let x2 = lastRect.left + lastRect.width / 2 - boardRect.left;
        let y2 = lastRect.top + lastRect.height / 2 - boardRect.top;

        // Extend line slightly beyond cell centers for cinematic slice effect
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            const extendPx = Math.min(boardRect.width * 0.08, 30);
            const ux = dx / length;
            const uy = dy / length;
            x1 -= ux * extendPx;
            y1 -= uy * extendPx;
            x2 += ux * extendPx;
            y2 += uy * extendPx;
        }

        strikeSvg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);

        const lineClass = winner === 'X' ? 'strike-laser x-win' : 'strike-laser o-win';
        strikeSvg.innerHTML = `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${lineClass}" />
        `;
    }

    window.addEventListener('resize', () => {
        if (game.isGameOver && game.winningLine) {
            drawWinningLaser(game.winningLine, game.winner);
        }
    });

    function clearWinningLaser() {
        strikeSvg.innerHTML = '';
        document.querySelectorAll('.cell.winner-cell').forEach(c => c.classList.remove('winner-cell'));
    }

    function highlightWinningCells(indices) {
        indices.forEach(idx => {
            const cell = boardGrid.querySelector(`[data-index="${idx}"]`);
            if (cell) cell.classList.add('winner-cell');
        });
    }

    // Turn & Status Indicators
    function updateTurnIndicator() {
        if (game.isGameOver) return;

        boardGrid.classList.remove('turn-x', 'turn-o');
        turnDot.classList.remove('turn-o');

        if (game.currentPlayer === 'X') {
            boardGrid.classList.add('turn-x');
            turnDot.style.background = 'var(--color-x)';
            turnDot.style.boxShadow = '0 0 10px var(--color-x)';
            statusText.textContent = game.mode === 'ai' ? "Your Turn (X)" : "Player X's Turn";
        } else {
            boardGrid.classList.add('turn-o');
            turnDot.classList.add('turn-o');
            turnDot.style.background = 'var(--color-o)';
            turnDot.style.boxShadow = '0 0 10px var(--color-o)';
            statusText.textContent = game.mode === 'ai' ? "CyberBot's Turn (O)" : "Player O's Turn";
        }
    }

    function updateScoreboard() {
        scoreX.textContent = game.scores.xWins;
        scoreO.textContent = game.scores.oWins;
        scoreTies.textContent = `${game.scores.ties} Ties`;

        if (game.scores.currentStreak > 0) {
            streakCount.textContent = `${game.scores.currentStreak} 🔥`;
        } else {
            streakCount.textContent = `0 🔥`;
        }
    }

    function updateUndoButton() {
        btnUndo.disabled = game.moveHistory.length === 0 || isAiThinking;
    }

    // Sound Button
    function updateSoundButtonIcon() {
        const isMuted = sound.isMuted();
        btnSound.innerHTML = isMuted ? `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
        ` : `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
        `;
        btnSound.setAttribute('aria-label', isMuted ? 'Unmute Audio' : 'Mute Audio');
    }

    btnSound.addEventListener('click', () => {
        sound.toggleMute();
        updateSoundButtonIcon();
        if (!sound.isMuted()) sound.playClick();
    });

    // Theme Modal
    btnTheme.addEventListener('click', () => {
        sound.playClick();
        themeModal.classList.add('active');
    });

    modalClose.addEventListener('click', () => {
        sound.playClick();
        themeModal.classList.remove('active');
    });

    themeModal.addEventListener('click', (e) => {
        if (e.target === themeModal) {
            themeModal.classList.remove('active');
        }
    });

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            sound.playClick();
            const choice = btn.getAttribute('data-theme-choice');
            setTheme(choice);
        });
    });

    // Restart Round
    btnRestart.addEventListener('click', () => {
        sound.playReset();
        confetti.stop();
        game.resetGame();
        renderBoard();
    });

    // Reset Scores
    btnResetStats.addEventListener('click', () => {
        sound.playClick();
        if (confirm('Reset all match scores and streaks?')) {
            game.resetScores();
            updateScoreboard();
        }
    });

    // Undo Move
    btnUndo.addEventListener('click', () => {
        if (isAiThinking) return;
        sound.playClick();
        confetti.stop();
        clearWinningLaser();
        const success = game.undoMove();
        if (success) {
            renderBoard();
        }
    });

    // Animated Replay Feature
    btnReplay.addEventListener('click', () => {
        if (game.moveHistory.length === 0 || isAiThinking) return;
        sound.playClick();
        confetti.stop();
        clearWinningLaser();

        const historyCopy = [...game.moveHistory];
        game.resetGame();
        renderBoard();
        isAiThinking = true;
        btnReplay.disabled = true;
        btnUndo.disabled = true;
        btnRestart.disabled = true;

        statusText.textContent = '🎬 Replaying Match...';

        let step = 0;
        const interval = setInterval(() => {
            if (step >= historyCopy.length) {
                clearInterval(interval);
                isAiThinking = false;
                btnReplay.disabled = false;
                btnRestart.disabled = false;
                updateUndoButton();
                return;
            }

            const move = historyCopy[step];
            const result = game.makeMove(move.index);
            sound.playMove(move.player);
            updateCellUI(move.index, move.player);

            if (result.gameOver) {
                handleGameOver(result);
            } else {
                updateTurnIndicator();
            }

            step++;
        }, 550);
    });

    // Segmented Controls
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sound.playClick();
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.getAttribute('data-mode');
            game.mode = mode;

            if (mode === 'ai') {
                diffControl.style.display = 'flex';
                playerOName.textContent = 'CyberBot';
            } else {
                diffControl.style.display = 'none';
                playerOName.textContent = 'Player O';
            }

            game.resetGame();
            renderBoard();
        });
    });

    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sound.playClick();
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            game.difficulty = btn.getAttribute('data-diff');
        });
    });

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sound.playClick();
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const size = parseInt(btn.getAttribute('data-size'), 10);
            game.setBoardSize(size);
            renderBoard();
        });
    });

    // Keyboard Shortcuts (1-9 on numpad/digits for cells, R for reset, U for undo)
    window.addEventListener('keydown', (e) => {
        // Digits 1-9
        if (e.key >= '1' && e.key <= '9') {
            const cellIndex = parseInt(e.key, 10) - 1;
            if (cellIndex < game.size * game.size) {
                handleCellClick(cellIndex);
            }
        } else if (e.key === 'r' || e.key === 'R') {
            if (!isAiThinking) {
                sound.playReset();
                confetti.stop();
                game.resetGame();
                renderBoard();
            }
        } else if (e.key === 'u' || e.key === 'U') {
            if (!isAiThinking && game.moveHistory.length > 0) {
                sound.playClick();
                confetti.stop();
                clearWinningLaser();
                game.undoMove();
                renderBoard();
            }
        } else if (e.key === 'm' || e.key === 'M') {
            sound.toggleMute();
            updateSoundButtonIcon();
        }
    });

    // Initial Render
    renderBoard();
});
