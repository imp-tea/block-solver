let totalScore = 0;
let combo = 1;
let lastPoints = 0;
let suggestedMoveSequence = null;

// Left grid (8x8)
let leftGridArray = [];
for (let i = 0; i < 8; i++) {
    leftGridArray[i] = [];
    for (let j = 0; j < 8; j++) {
        leftGridArray[i][j] = 0;
    }
}

// Right grids
let rightGridArrays = [[], [], []];

// Initialize right grids with a single active center cell
for (let k = 0; k < 3; k++) {
    rightGridArrays[k] = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ];
}

function createLeftGrid() {
    const leftGrid = document.getElementById('left-grid');
    leftGrid.innerHTML = '';

    const gridSize = calculateLeftGridSize();
    leftGrid.style.width = gridSize + 'px';
    leftGrid.style.height = gridSize + 'px';

    leftGrid.style.display = 'grid';
    leftGrid.style.gridTemplateColumns = `repeat(8, 1fr)`;
    leftGrid.style.gridTemplateRows = `repeat(8, 1fr)`;
    leftGrid.style.gap = '2px';

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            if (leftGridArray[i][j] === 1) {
                cell.classList.add('on');
            }
            if (highlightGridArray[i][j]) {
                cell.style.backgroundColor = highlightGridArray[i][j];
            }
            cell.addEventListener('click', () => {
                leftGridArray[i][j] = leftGridArray[i][j] ? 0 : 1;
                // Clear the highlightGridArray when the grid is manually modified
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        highlightGridArray[i][j] = null;
                    }
                }
                suggestedMoveSequence = null;
                document.getElementById('play-suggestion-button').disabled = true;
                createLeftGrid();
            });
            leftGrid.appendChild(cell);
        }
    }
}



function calculateLeftGridSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const gridWidth = (screenWidth - 20) / 2;
    const gridHeight = (screenHeight - 20) / 2;
    return Math.min(gridWidth, gridHeight);
}

function calculateMainGridCellSize() {
    const gridSize = calculateLeftGridSize();
    const totalGapSize = (8 - 1) * 2; // total gaps between cells
    const cellSize = (gridSize - totalGapSize) / 8;
    return cellSize;
}

function createRightGrid(gridIndex) {
    const gridContainer = document.getElementsByClassName('grid-container')[gridIndex];
    const rightGrid = gridContainer.getElementsByClassName('right-grid')[0];

    rightGrid.innerHTML = '';

    const maxSize = calculateRightGridSize();
    const gridArray = rightGridArrays[gridIndex];
    const rows = gridArray.length;
    const cols = gridArray[0].length;

    // Calculate cell size to maintain square cells
    const cellSize = Math.min(
        Math.floor((maxSize.width - (cols - 1) * 2) / cols),
        Math.floor((maxSize.height - (rows - 1) * 2) / rows)
    );

    const gridWidth = cellSize * cols + (cols - 1) * 2;
    const gridHeight = cellSize * rows + (rows - 1) * 2;

    rightGrid.style.width = gridWidth + 'px';
    rightGrid.style.height = gridHeight + 'px';

    rightGrid.style.display = 'grid';
    rightGrid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    rightGrid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    rightGrid.style.gap = '2px';

    // Create cells and add event listeners
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            if (gridArray[i][j] === 1) {
                cell.classList.add('on');
            }
            cell.addEventListener('mousedown', (event) => {
                handleCellMouseDown(event, gridIndex, i, j);
            });
            rightGrid.appendChild(cell);
        }
    }
}

function handleCellMouseDown(event, gridIndex, i, j) {
    event.preventDefault();

    let timerFired = false;
    let lastMouseEvent = event;

    // Start timer
    const timerId = setTimeout(() => {
        timerFired = true;
        // Remove mouseup and mousemove listeners
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);

        // Begin drag operation
        startDrag(lastMouseEvent, gridIndex);
    }, 200); // 100 milliseconds

    function onMouseUp(event) {
        clearTimeout(timerId);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);

        if (!timerFired) {
            // Toggle cell state
            const gridArray = rightGridArrays[gridIndex];
            gridArray[i][j] = gridArray[i][j] ? 0 : 1;
            adjustGridSize(gridIndex);
            createRightGrid(gridIndex);
        }
    }

    function onMouseMove(event) {
        lastMouseEvent = event;
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
}

function calculateRightGridSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxHeight = (screenHeight - 20) / 3 - 20; // Adjusted for padding
    const maxWidth = (screenWidth - 20) / 2;
    return {
        width: maxWidth,
        height: maxHeight
    };
}

function adjustGridSize(gridIndex) {
    const gridArray = rightGridArrays[gridIndex];

    // Remove empty first rows
    while (gridArray.length > 1 && isRowEmpty(gridArray, 0)) {
        gridArray.shift();
    }

    // Remove empty last rows
    while (gridArray.length > 1 && isRowEmpty(gridArray, gridArray.length - 1)) {
        gridArray.pop();
    }

    // Remove empty first columns
    while (gridArray[0].length > 1 && isColumnEmpty(gridArray, 0)) {
        for (let i = 0; i < gridArray.length; i++) {
            gridArray[i].shift();
        }
    }

    // Remove empty last columns
    while (gridArray[0].length > 1 && isColumnEmpty(gridArray, gridArray[0].length - 1)) {
        for (let i = 0; i < gridArray.length; i++) {
            gridArray[i].pop();
        }
    }

    // Ensure the grid doesn't become empty
    if (gridArray.length === 0 || gridArray[0].length === 0) {
        gridArray.length = 1;
        gridArray[0] = [0];
    }

    // Ensure first and last rows/columns are empty
    addEmptyBorder(gridArray);
}

function isRowEmpty(gridArray, rowIndex) {
    if (gridArray[rowIndex] === undefined) return false;
    return gridArray[rowIndex].every(cell => cell === 0);
}

function isColumnEmpty(gridArray, colIndex) {
    for (let i = 0; i < gridArray.length; i++) {
        if (gridArray[i][colIndex] !== 0) {
            return false;
        }
    }
    return true;
}

function addEmptyBorder(gridArray) {
    const cols = gridArray[0].length;

    // Add empty first row if needed
    if (!isRowEmpty(gridArray, 0)) {
        const emptyRow = new Array(cols).fill(0);
        gridArray.unshift(emptyRow);
    }

    // Add empty last row if needed
    if (!isRowEmpty(gridArray, gridArray.length - 1)) {
        const emptyRow = new Array(cols).fill(0);
        gridArray.push(emptyRow);
    }

    // Add empty first column if needed
    if (!isColumnEmpty(gridArray, 0)) {
        for (let i = 0; i < gridArray.length; i++) {
            gridArray[i].unshift(0);
        }
    }

    // Add empty last column if needed
    if (!isColumnEmpty(gridArray, gridArray[0].length - 1)) {
        for (let i = 0; i < gridArray.length; i++) {
            gridArray[i].push(0);
        }
    }
}

function trimPieceArray(pieceArray) {
    let trimmedArray = pieceArray.map(row => row.slice()); // Deep copy

    // Remove empty rows from the top
    while (trimmedArray.length > 0 && trimmedArray[0].every(cell => cell === 0)) {
        trimmedArray.shift();
    }

    // Remove empty rows from the bottom
    while (trimmedArray.length > 0 && trimmedArray[trimmedArray.length - 1].every(cell => cell === 0)) {
        trimmedArray.pop();
    }

    // Remove empty columns from the left
    while (trimmedArray.length > 0 && trimmedArray[0].length > 0 && trimmedArray.every(row => row[0] === 0)) {
        for (let i = 0; i < trimmedArray.length; i++) {
            trimmedArray[i].shift();
        }
    }

    // Remove empty columns from the right
    while (trimmedArray.length > 0 && trimmedArray[0].length > 0 && trimmedArray.every(row => row[row.length - 1] === 0)) {
        for (let i = 0; i < trimmedArray.length; i++) {
            trimmedArray[i].pop();
        }
    }

    return trimmedArray;
}

function startDrag(event, gridIndex) {
    // Prevent default behavior
    event.preventDefault();

    const gridArray = rightGridArrays[gridIndex];
    const trimmedPieceArray = trimPieceArray(gridArray);

    // Create ghost element
    const ghost = document.createElement('div');
    ghost.classList.add('ghost-piece');

    // Build the grid inside the ghost element
    const rows = trimmedPieceArray.length;
    const cols = trimmedPieceArray[0].length;

    // Calculate the size of the main grid cells
    const mainGridCellSize = calculateMainGridCellSize();

    const cellSize = mainGridCellSize; // Use same cell size as main grid

    ghost.style.position = 'absolute';
    ghost.style.zIndex = '1000';

    ghost.style.display = 'grid';
    ghost.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    ghost.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    ghost.style.gap = '2px';

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            if (trimmedPieceArray[i][j] === 1) {
                cell.classList.add('on');
                cell.style.backgroundColor = 'lightgray'; // While dragging, the piece's color should be light gray
            } else {
                cell.style.opacity = '0'; // Hide inactive cells
            }
            ghost.appendChild(cell);
        }
    }

    document.body.appendChild(ghost);

    // Move ghost to initial position
    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
        ghost.style.left = pageX - ghost.offsetWidth / 2 + 'px';
        ghost.style.top = pageY - ghost.offsetHeight / 2 + 'px';
    }

    const leftGrid = document.getElementById('left-grid');
    const leftGridRect = leftGrid.getBoundingClientRect();

    function onMouseMove(event) {
        const mainGridCellSize = calculateMainGridCellSize();

        if (event.clientX >= leftGridRect.left &&
            event.clientX <= leftGridRect.right &&
            event.clientY >= leftGridRect.top &&
            event.clientY <= leftGridRect.bottom) {

            // Calculate grid coordinates
            const x = event.clientX - leftGridRect.left;
            const y = event.clientY - leftGridRect.top;

            const cellSizeWithGap = mainGridCellSize + 2; // Include gap

            const gridX = Math.floor(x / cellSizeWithGap);
            const gridY = Math.floor(y / cellSizeWithGap);

            // Calculate snapped position
            const snappedX = leftGridRect.left + gridX * cellSizeWithGap;
            const snappedY = leftGridRect.top + gridY * cellSizeWithGap;

            ghost.style.left = snappedX + 'px';
            ghost.style.top = snappedY + 'px';
        } else {
            // Not over main grid, follow mouse
            moveAt(event.pageX, event.pageY);
        }
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp(event) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Remove ghost element
        ghost.parentNode.removeChild(ghost);

        const mainGridCellSize = calculateMainGridCellSize();

        // Check if dropped over main grid
        if (event.clientX >= leftGridRect.left &&
            event.clientX <= leftGridRect.right &&
            event.clientY >= leftGridRect.top &&
            event.clientY <= leftGridRect.bottom) {

            // Calculate grid coordinates
            const x = event.clientX - leftGridRect.left;
            const y = event.clientY - leftGridRect.top;

            const cellSizeWithGap = mainGridCellSize + 2; // Include gap

            const gridX = Math.floor(x / cellSizeWithGap);
            const gridY = Math.floor(y / cellSizeWithGap);

            // Attempt to place the piece at gridX, gridY
            if (tryPlacePiece(trimmedPieceArray, gridX, gridY)) {
                // Placement successful
                createLeftGrid();
                // Clear the sub grid
                rightGridArrays[gridIndex] = [
                    [0]
                ];
                createRightGrid(gridIndex);
            } else {
                // Placement failed, do nothing
            }
        }
    }

    document.addEventListener('mouseup', onMouseUp);
}

function tryPlacePiece(pieceArray, gridX, gridY, skipHighlightClear, currentCombo) {
    const pieceRows = pieceArray.length;
    const pieceCols = pieceArray[0].length;

    // Check boundaries
    if (gridY < 0 || gridY + pieceRows > 8 || gridX < 0 || gridX + pieceCols > 8) {
        return false; // Piece goes out of main grid
    }

    // Check for overlap
    for (let i = 0; i < pieceRows; i++) {
        for (let j = 0; j < pieceCols; j++) {
            if (pieceArray[i][j] === 1 && leftGridArray[gridY + i][gridX + j] === 1) {
                return false; // Overlapping active cells
            }
        }
    }

    // Place the piece
    for (let i = 0; i < pieceRows; i++) {
        for (let j = 0; j < pieceCols; j++) {
            if (pieceArray[i][j] === 1) {
                leftGridArray[gridY + i][gridX + j] = 1;
            }
        }
    }

    // Calculate points from placing the piece
    let cellsPlaced = 0;
    for (let i = 0; i < pieceRows; i++) {
        for (let j = 0; j < pieceCols; j++) {
            if (pieceArray[i][j] === 1) {
                cellsPlaced += 1;
            }
        }
    }

    // Use provided combo or global combo
    let comboToUse = currentCombo !== undefined ? currentCombo : combo;

    // Active cells placed are not multiplied by combo
    lastPoints = cellsPlaced;
    totalScore += lastPoints;

    // Check for filled lines and update score and combo
    let totalLinesCleared = checkAndClearFilledLinesWithCombo(comboToUse);

    // Update combo
    if (totalLinesCleared > 0) {
        for (let n = 0; n < totalLinesCleared; n++) {
            comboToUse += 1;
        }
    } else {
        comboToUse = 1;
    }

    if (currentCombo === undefined) {
        combo = comboToUse;
    }

    // Clear the highlightGridArray if not skipped
    if (!skipHighlightClear) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                highlightGridArray[i][j] = null;
            }
        }
    }

    createLeftGrid();
    updateScoreDisplay();

    return currentCombo !== undefined ? comboToUse : true;
}



function checkAndClearFilledLinesWithCombo(comboToUse) {
    let rowsCleared = [];
    let colsCleared = [];

    // Check and collect filled rows
    for (let i = 0; i < 8; i++) {
        if (leftGridArray[i].every(cell => cell === 1)) {
            rowsCleared.push(i);
        }
    }

    // Check and collect filled columns
    for (let j = 0; j < 8; j++) {
        if (leftGridArray.every(row => row[j] === 1)) {
            colsCleared.push(j);
        }
    }

    // Clear filled rows
    for (let rowIndex of rowsCleared) {
        leftGridArray[rowIndex].fill(0);
    }

    // Clear filled columns
    for (let colIndex of colsCleared) {
        for (let i = 0; i < 8; i++) {
            leftGridArray[i][colIndex] = 0;
        }
    }

    // Calculate points from cleared lines and update score
    let totalLinesCleared = rowsCleared.length + colsCleared.length;
    if (totalLinesCleared > 0) {
        for (let n = 0; n < totalLinesCleared; n++) {
            totalScore += 18 * (comboToUse-n);
            lastPoints += 18 * (comboToUse-n);
            comboToUse += 1;
        }
    }

    return totalLinesCleared;
}


function updateScoreDisplay() {
    document.getElementById('total-score').textContent = 'Score: ' + totalScore;
    document.getElementById('combo').textContent = 'Combo: ' + combo;
    document.getElementById('last-points').textContent = 'Last Move Points: ' + lastPoints;
}

document.addEventListener('DOMContentLoaded', () => {
    createLeftGrid();
    for (let k = 0; k < 3; k++) {
        createRightGrid(k);
    }

    document.getElementById('calculate-best-move-button').addEventListener('click', calculateBestMove);
    document.getElementById('play-suggestion-button').addEventListener('click', playSuggestedMoves);

    window.addEventListener('resize', () => {
        createLeftGrid();
        for (let k = 0; k < 3; k++) {
            createRightGrid(k);
        }
    });
});


// Initialize the highlight grid
let highlightGridArray = [];
for (let i = 0; i < 8; i++) {
    highlightGridArray[i] = [];
    for (let j = 0; j < 8; j++) {
        highlightGridArray[i][j] = null;
    }
}

// Function to check if a shape can be placed on the grid
function canPlaceShape(shape, gridX, gridY, grid) {
    const gridSize = grid.length;
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    // Check boundaries
    if (gridY < 0 || gridY + shapeRows > gridSize || gridX < 0 || gridX + shapeCols > gridSize) {
        return false; // Shape goes out of grid
    }

    // Check for overlap
    for (let y = 0; y < shapeRows; y++) {
        for (let x = 0; x < shapeCols; x++) {
            if (shape[y][x] === 1 && grid[gridY + y][gridX + x] === 1) {
                return false; // Overlapping active cells
            }
        }
    }

    return true;
}

function recursivePlaceAndScore(shape, gridX, gridY, grid, currentCombo) {
    const newGrid = grid.map(row => row.slice()); // Deep copy of the grid
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    let cellsPlaced = 0;

    // Place the shape
    for (let y = 0; y < shapeRows; y++) {
        for (let x = 0; x < shapeCols; x++) {
            if (shape[y][x] === 1) {
                newGrid[gridY + y][gridX + x] = 1;
                cellsPlaced += 1;
            }
        }
    }

    // Active cells placed are not multiplied by combo
    let lastPoints = cellsPlaced;

    // Now check for line clears
    let clearedLines = [];
    let newCombo = currentCombo;

    // Check and collect filled rows
    for (let i = 0; i < 8; i++) {
        if (newGrid[i].every(cell => cell === 1)) {
            clearedLines.push({ type: 'row', index: i });
        }
    }

    // Check and collect filled columns
    for (let j = 0; j < 8; j++) {
        if (newGrid.every(row => row[j] === 1)) {
            clearedLines.push({ type: 'col', index: j });
        }
    }

    // Clear the lines
    if (clearedLines.length > 0) {
        for (let line of clearedLines) {
            if (line.type === 'row') {
                newGrid[line.index].fill(0);
            } else if (line.type === 'col') {
                for (let i = 0; i < 8; i++) {
                    newGrid[i][line.index] = 0;
                }
            }
            lastPoints += 18 * newCombo;
            newCombo += 1;
        }
    } else {
        newCombo = 1; // Reset combo
    }

    return {
        newGrid,
        lastPoints,
        newCombo
    };
}


// Function to get all legal placements for a shape
function getAllLegalPlacements(shape, grid) {
    if (!shape || shape.length === 0 || shape[0].length === 0) {
        return [];
    }
    const gridSize = grid.length;
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    let positions = [];

    for (let gridY = 0; gridY <= gridSize - shapeRows; gridY++) {
        for (let gridX = 0; gridX <= gridSize - shapeCols; gridX++) {
            if (canPlaceShape(shape, gridX, gridY, grid)) {
                positions.push({ gridX, gridY });
            }
        }
    }
    return positions;
}


// Function to evaluate the board state
function evaluateBoard(grid) {
    let score = 0;
    score += countFilledSquares(grid) * 1.5;
    score += calculateChaos(grid) * 2.25;
    return score;
}

// Count active cells in the main grid
function countFilledSquares(grid) {
    let count = 0;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 1) {
                count++;
            }
        }
    }
    return count;
}

// Determine how organized the grid is
function calculateChaos(grid) {
    let q = 0;

    // Horizontal segments
    for (let y = 0; y < 8; y++) {
        let segments = 0;
        for (let x = 1; x < 8; x++) {
            if (grid[y][x] !== grid[y][x - 1]) segments += 1;
        }
        q += segments;
    }

    // Vertical segments
    for (let x = 0; x < 8; x++) {
        let segments = 0;
        for (let y = 1; y < 8; y++) {
            if (grid[y][x] !== grid[y - 1][x]) segments += 1;
        }
        q += segments;
    }

    return q;
}

// Function to find the best sequence of moves
function findBestSequence(pieces, grid, currentCombo) {
    let bestResult = {
        evaluationScore: Infinity,
        moveSequence: [],
        grid: null,
        gameScore: 0
    };

    function search(currentGrid, remainingPieces, moveSequence, currentScore, combo) {
        if (remainingPieces.length === 0) {
            // Evaluate the board
            const evaluationScore = evaluateBoard(currentGrid);
            if (
                evaluationScore < bestResult.evaluationScore ||
                (evaluationScore === bestResult.evaluationScore && currentScore > bestResult.gameScore)
            ) {
                bestResult.evaluationScore = evaluationScore;
                bestResult.moveSequence = moveSequence.slice();
                bestResult.grid = currentGrid.map(row => row.slice()); // Deep copy
                bestResult.gameScore = currentScore;
            }
            return;
        }

        for (let i = 0; i < remainingPieces.length; i++) {
            const { pieceIndex, shape } = remainingPieces[i];
            const placements = getAllLegalPlacements(shape, currentGrid);
            if (placements.length === 0) continue; // Can't place this piece anywhere
            for (let placement of placements) {
                const {
                    newGrid,
                    lastPoints,
                    newCombo
                } = recursivePlaceAndScore(shape, placement.gridX, placement.gridY, currentGrid, combo);

                let totalScore = currentScore + lastPoints;

                const newMoveSequence = moveSequence.concat({
                    pieceIndex,
                    shape,
                    gridX: placement.gridX,
                    gridY: placement.gridY
                });

                const newRemainingPieces = remainingPieces.slice(0, i).concat(remainingPieces.slice(i + 1));

                search(newGrid, newRemainingPieces, newMoveSequence, totalScore, newCombo);
            }
        }
    }

    search(grid, pieces, [], 0, currentCombo);

    if (bestResult.moveSequence.length < pieces.length) {
        return null;
    }

    return bestResult;
}


function calculateBestMove() {
    // Get the trimmed versions of the pieces with their indices
    let trimmedPieces = rightGridArrays.map((pieceArray, index) => ({ shape: trimPieceArray(pieceArray), pieceIndex: index }));

    // Filter out empty shapes
    trimmedPieces = trimmedPieces.filter(piece => piece.shape.length > 0 && piece.shape[0].length > 0);

    // Copy the leftGridArray
    let gridCopy = leftGridArray.map(row => row.slice());

    // Get the current combo
    let currentCombo = combo;

    // Call findBestSequence
    let bestResult = findBestSequence(trimmedPieces, gridCopy, currentCombo);

    if (bestResult === null) {
        alert('No valid moves found');
        document.getElementById('play-suggestion-button').disabled = true;
        suggestedMoveSequence = null;
        return;
    }

    suggestedMoveSequence = bestResult.moveSequence;

    // Enable the "Play Suggestion" button
    document.getElementById('play-suggestion-button').disabled = false;

    // Reset highlightGridArray
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            highlightGridArray[i][j] = null;
        }
    }

    // For each move in the moveSequence, update highlightGridArray
    let colors = ['rgba(255, 0, 0, 0.33)', 'rgba(0, 255, 0, 0.33)', 'rgba(0, 0, 255, 0.33)'];
    bestResult.moveSequence.forEach((move, index) => {
        let color = colors[index % colors.length];
        let shape = move.shape;
        let gridX = move.gridX;
        let gridY = move.gridY;
        let shapeRows = shape.length;
        let shapeCols = shape[0].length;

        for (let y = 0; y < shapeRows; y++) {
            for (let x = 0; x < shapeCols; x++) {
                if (shape[y][x] === 1) {
                    highlightGridArray[gridY + y][gridX + x] = color;
                }
            }
        }
    });

    // Redraw the left grid
    createLeftGrid();
}


function playSuggestedMoves() {
    if (!suggestedMoveSequence) {
        return;
    }

    // Keep track of the combo
    let currentCombo = combo;

    suggestedMoveSequence.forEach((move) => {
        let shape = move.shape;
        let gridX = move.gridX;
        let gridY = move.gridY;

        // Place the piece on the left grid
        let comboResult = tryPlacePiece(shape, gridX, gridY, true, currentCombo);

        if (comboResult === false) {
            // Should not happen, but handle error
            console.error('Failed to place piece during playSuggestedMoves');
            return;
        } else {
            currentCombo = comboResult;
        }

        // Remove the piece from the right grid
        rightGridArrays[move.pieceIndex] = [[0]];
        createRightGrid(move.pieceIndex);
    });

    // Update the global combo
    combo = currentCombo;

    // Clear the highlightGridArray
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            highlightGridArray[i][j] = null;
        }
    }

    // Reset suggestedMoveSequence
    suggestedMoveSequence = null;

    // Disable the "Play Suggestion" button
    document.getElementById('play-suggestion-button').disabled = true;

    // Update the displays
    createLeftGrid();
    updateScoreDisplay();
}
