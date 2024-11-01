document.addEventListener('DOMContentLoaded', () => {
    const chessboard = document.getElementById('chessboard');
    const messageDisplay = document.getElementById('message');
    const themeSelect = document.getElementById('themeSelect');
    const playerVsAIButton = document.getElementById('playerVsAI');
    const playerVsPlayerButton = document.getElementById('playerVsPlayer');

    let initialSetup = [
        'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
        'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
        'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
    ];

    const pieceSymbols = {
        'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
        'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };

    let selectedPiece = null;
    let currentTurn = 'white';
    let mode = 'playerVsPlayer';
    let enPassantTarget = null;
    let castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    };

    themeSelect.addEventListener('change', () => {
        chessboard.className = `theme-${themeSelect.value}`;
    });

    playerVsAIButton.addEventListener('click', () => {
        mode = 'playerVsAI';
        showMessage("Player vs AI Mode Selected");
        resetBoard();
    });

    playerVsPlayerButton.addEventListener('click', () => {
        mode = 'playerVsPlayer';
        showMessage("Player vs Player Mode Selected");
        resetBoard();
    });

    const createBoard = () => {
        chessboard.innerHTML = '';
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            const row = Math.floor(i / 8);
            const col = i % 8;
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'dark');
            square.dataset.index = i;
            square.textContent = pieceSymbols[initialSetup[i]] || '';
            square.addEventListener('click', () => handleSquareClick(i));
            chessboard.appendChild(square);
        }
    };

    const resetBoard = () => {
        initialSetup = [
            'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
            'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
            'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
        ];
        currentTurn = 'white';
        createBoard();
    };

    const handleSquareClick = (index) => {
        const piece = initialSetup[index];
        if (selectedPiece) {
            const isValidMove = validateMove(selectedPiece.index, index, selectedPiece.piece);
            if (isValidMove) {
                movePiece(selectedPiece.index, index);
                checkEndConditions();
                selectedPiece = null;
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
                if (mode === 'playerVsAI' && currentTurn === 'black') {
                    aiMove();
                }
            } else {
                showMessage("Illegal move", "error");
            }
        } else if (piece && isCorrectTurn(piece)) {
            selectedPiece = { index, piece };
        }
    };

    const aiMove = () => {
        const possibleMoves = [];
        for (let i = 0; i < initialSetup.length; i++) {
            if (initialSetup[i] && currentTurn === 'black' && initialSetup[i] === initialSetup[i].toLowerCase()) {
                for (let j = 0; j < initialSetup.length; j++) {
                    if (validateMove(i, j, initialSetup[i])) {
                        possibleMoves.push({ from: i, to: j });
                    }
                }
            }
        }
        if (possibleMoves.length > 0) {
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            movePiece(move.from, move.to);
            checkEndConditions();
            currentTurn = 'white';
            showMessage("AI move completed.", "info");
        }
    };

    const validateMove = (fromIndex, toIndex, piece) => {
        if (piece.toLowerCase() === 'p') {
            const direction = piece === 'P' ? -1 : 1;
            if (toIndex === fromIndex + 8 * direction && !initialSetup[toIndex]) return true;
            if ((toIndex === fromIndex + 16 * direction) && fromIndex / 8 === (piece === 'P' ? 6 : 1) && !initialSetup[toIndex]) return true;
            if (Math.abs(toIndex - fromIndex) === 9 || Math.abs(toIndex - fromIndex) === 7) {
                if (initialSetup[toIndex] && isOpponentPiece(toIndex, piece)) return true;
                if (toIndex === enPassantTarget) return true;
            }
            return false;
        }
        if (piece.toLowerCase() === 'n') {
            const knightMoves = [15, 17, -15, -17, 10, -10, 6, -6];
            return knightMoves.includes(toIndex - fromIndex) && (!initialSetup[toIndex] || isOpponentPiece(toIndex, piece));
        }
        if (piece.toLowerCase() === 'k') {
            if (Math.abs(toIndex - fromIndex) === 2 && canCastle(toIndex, piece)) return true;
            const kingMoves = [1, -1, 8, -8, 9, -9, 7, -7];
            return kingMoves.includes(toIndex - fromIndex) && (!initialSetup[toIndex] || isOpponentPiece(toIndex, piece));
        }
        return true;
    };

    const movePiece = (fromIndex, toIndex) => {
        const piece = initialSetup[fromIndex];
        initialSetup[toIndex] = piece;
        initialSetup[fromIndex] = '';
        if (piece.toLowerCase() === 'p' && Math.abs(toIndex - fromIndex) === 16) {
            enPassantTarget = (fromIndex + toIndex) / 2;
        } else {
            enPassantTarget = null;
        }
    };

    const checkEndConditions = () => {
        if (isCheckmate()) {
            showMessage(currentTurn === 'white' ? "Checkmate! Black wins!" : "Checkmate! White wins!", "victory");
        } else if (isStalemate()) {
            showMessage("Draw by stalemate", "draw");
        }
    };

    const isCorrectTurn = (piece) => {
        return (currentTurn === 'white' && piece === piece.toUpperCase()) || (currentTurn === 'black' && piece === piece.toLowerCase());
    };

    const canCastle = (toIndex, piece) => {
        const side = piece === 'K' ? 'white' : 'black';
        const isKingSide = toIndex > 60;
        if (!castlingRights[side][isKingSide ? 'kingSide' : 'queenSide']) return false;
        const rookPosition = isKingSide ? toIndex + 1 : toIndex - 2;
        return initialSetup[rookPosition] && initialSetup[rookPosition].toLowerCase() === 'r';
    };

    const isCheckmate = () => {
        for (let i = 0; i < initialSetup.length; i++) {
            if (initialSetup[i] && ((currentTurn === 'white' && initialSetup[i] === initialSetup[i].toUpperCase()) || (currentTurn === 'black' && initialSetup[i] === initialSetup[i].toLowerCase()))) {
                for (let j = 0; j < initialSetup.length; j++) {
                    if (validateMove(i, j, initialSetup[i])) return false;
                }
            }
        }
        return true;
    };

    const isStalemate = () => {
        for (let i = 0; i < initialSetup.length; i++) {
            if (initialSetup[i] && ((currentTurn === 'white' && initialSetup[i] === initialSetup[i].toUpperCase()) || (currentTurn === 'black' && initialSetup[i] === initialSetup[i].toLowerCase()))) {
                for (let j = 0; j < initialSetup.length; j++) {
                    if (validateMove(i, j, initialSetup[i])) return false;
                }
            }
        }
        return true;
    };

    const isOpponentPiece = (index, piece) => {
        return (piece === piece.toUpperCase() && initialSetup[index] === initialSetup[index].toLowerCase()) || (piece === piece.toLowerCase() && initialSetup[index] === initialSetup[index].toUpperCase());
    };

    const showMessage = (text, type) => {
        messageDisplay.textContent = text;
        messageDisplay.className = type;
    };

    createBoard();
});
