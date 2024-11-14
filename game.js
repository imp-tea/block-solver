let totalScore = 0;
let combo = 1;
let lastPoints = 0;


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

// Store event listeners for right grids
let rightGridMouseDownListeners = [];

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
            cell.addEventListener('click', () => {
                leftGridArray[i][j] = leftGridArray[i][j] ? 0 : 1;
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
    const editButton = gridContainer.getElementsByClassName('edit-button')[0];

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

    const isEditing = editButton.textContent === 'Editing';

    // Remove previous mousedown listener if any
    if (rightGridMouseDownListeners[gridIndex]) {
        rightGrid.removeEventListener('mousedown', rightGridMouseDownListeners[gridIndex]);
    }

    function handleMouseDown(event) {
        if (editButton.textContent === 'Locked') {
            startDrag(event, gridIndex);
        }
    }

    rightGrid.addEventListener('mousedown', handleMouseDown);
    rightGridMouseDownListeners[gridIndex] = handleMouseDown;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            if (gridArray[i][j] === 1) {
                cell.classList.add('on');
            }
            if (isEditing) {
                cell.addEventListener('click', () => {
                    gridArray[i][j] = gridArray[i][j] ? 0 : 1;
                    adjustGridSize(gridIndex);
                    createRightGrid(gridIndex);
                });
            }
            rightGrid.appendChild(cell);
        }
    }
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

function tryPlacePiece(pieceArray, gridX, gridY) {
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
    lastPoints = cellsPlaced * combo;
    totalScore += lastPoints;

    // Check for filled lines and update score and combo
    checkAndClearFilledLines();

    // Update the display
    updateScoreDisplay();
    createLeftGrid();

    return true;
}

function checkAndClearFilledLines() {
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

    // Calculate points from cleared lines and update combo
    let totalLinesCleared = rowsCleared.length + colsCleared.length;
    if (totalLinesCleared > 0) {
        for (let n = 0; n < totalLinesCleared; n++) {
            totalScore += 8 * combo;
            lastPoints += 8 * combo;
            combo += 1;
        }
    } else {
        combo = 1; // Reset combo if no lines cleared
    }
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

    const editButtons = document.getElementsByClassName('edit-button');
    for (let i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener('click', function() {
            if (this.textContent === 'Locked') {
                this.textContent = 'Editing';
            } else {
                this.textContent = 'Locked';
            }
            createRightGrid(i); // Recreate grid to update event listeners
        });
    }

    window.addEventListener('resize', () => {
        createLeftGrid();
        for (let k = 0; k < 3; k++) {
            createRightGrid(k);
        }
    });
});
