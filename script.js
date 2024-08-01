document.addEventListener('DOMContentLoaded', () => {
    const chessboard = document.getElementById('chessboard');
    const initialSetup = [
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
    let enPassantTarget = null;
    let castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    };

    const createBoard = () => {
        chessboard.innerHTML = '';
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.classList.add('square');

            // Determine if the square should be dark or white
            const row = Math.floor(i / 8);
            const col = i % 8;
            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('dark');
            }

            square.dataset.index = i;
            square.textContent = pieceSymbols[initialSetup[i]] || '';
            square.addEventListener('click', () => handleSquareClick(i));
            chessboard.appendChild(square);
        }
    };

    const handleSquareClick = (index) => {
        const piece = initialSetup[index];
        if (selectedPiece) {
            const isValidMove = validateMove(selectedPiece.index, index, selectedPiece.piece);
            if (isValidMove) {
                movePiece(selectedPiece.index, index);
                selectedPiece = null;
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
                enPassantTarget = null;
                updateBoard();
            } else {
                alert('Illegal move');
            }
        } else if (piece && ((currentTurn === 'white' && piece === piece.toUpperCase()) || (currentTurn === 'black' && piece === piece.toLowerCase()))) {
            selectedPiece = { index, piece };
        }
    };

    const validateMove = (fromIndex, toIndex, piece) => {
        // Implement move validation here including en passant and castling
        return true; // Replace with actual move validation logic
    };

    const movePiece = (fromIndex, toIndex) => {
        // Handle special moves
        const piece = initialSetup[fromIndex];
        initialSetup[toIndex] = piece;
        initialSetup[fromIndex] = '';
        if (piece.toLowerCase() === 'p' && Math.abs(toIndex - fromIndex) === 16) {
            enPassantTarget = (fromIndex + toIndex) / 2;
        } else {
            enPassantTarget = null;
        }
        // Handle castling logic
    };

    const updateBoard = () => {
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            square.textContent = pieceSymbols[initialSetup[index]] || '';
        });
    };

    createBoard();
});
