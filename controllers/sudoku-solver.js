class SudokuSolver {
  validate(puzzleString) {
    // Check if the string has exactly 81 characters
    if (puzzleString.length !== 81) {
      return false;
    }
    // Check if each character is a digit from 1 to 9 or a period
    const validChars = /^[1-9.]+$/;
    if (!validChars.test(puzzleString)) {
      return false;
    }
    return true;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const rowStart = row * 9;
    const rowEnd = rowStart + 9;
    for (let i = rowStart; i < rowEnd; i++) {
      if (puzzleString[i] === value && i !== column) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    for (let i = column; i < 81; i += 9) {
      if (puzzleString[i] === value && i !== row * 9 + column) {
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const rowStart = Math.floor(row / 3) * 3;
    const colStart = Math.floor(column / 3) * 3;
    for (let i = rowStart; i < rowStart + 3; i++) {
      for (let j = colStart; j < colStart + 3; j++) {
        if (puzzleString[i * 9 + j] === value && (i !== row || j !== column)) {
          return false;
        }
      }
    }
    return true;
  }

  solve(puzzleString) {
    if (!this.validate(puzzleString)) {
      return false;
    }
    const solveHelper = (puzzle) => {
      const emptyCellIndex = puzzle.indexOf(".");
      if (emptyCellIndex === -1) {
        return puzzle; // Puzzle solved
      }
      const row = Math.floor(emptyCellIndex / 9);
      const col = emptyCellIndex % 9;
      for (let num = 1; num <= 9; num++) {
        const value = num.toString();
        if (
          this.checkRowPlacement(puzzle, row, col, value) &&
          this.checkColPlacement(puzzle, row, col, value) &&
          this.checkRegionPlacement(puzzle, row, col, value)
        ) {
          const updatedPuzzle =
            puzzle.substring(0, emptyCellIndex) +
            value +
            puzzle.substring(emptyCellIndex + 1);
          const result = solveHelper(updatedPuzzle);
          if (result !== false) {
            return result; // Solution found
          }
        }
      }
      return false; // No solution found
    };

    return solveHelper(puzzleString);
  }
}

module.exports = SudokuSolver;
