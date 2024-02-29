"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    // Check if the request body contains puzzle, coordinate, and value
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }

    // Check if the puzzle contains only numbers and periods
    if (!/^[1-9.]+$/.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    // Check if the puzzle length is exactly 81 characters
    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    // Validate the coordinate
    const row = coordinate.split("")[0];
    const column = coordinate.split("")[1];
    if (
      coordinate.length !== 2 ||
      !/[a-i]/i.test(row) ||
      !/[1-9]/i.test(column)
    ) {
      return res.json({ error: "Invalid coordinate" });
    }

    // Convert the coordinate to row and column indices
    const rowIndex = row.toUpperCase().charCodeAt(0) - 65;
    const colIndex = parseInt(column) - 1;

    // Check if the value is a number between 1 and 9
    if (!/^[1-9]$/.test(value)) {
      return res.json({ error: "Invalid value" });
    }

    // Check if the value is already present at the coordinate
    if (puzzle[rowIndex * 9 + colIndex] === value) {
      return res.json({ valid: true });
    }

    // Check row, column, and region placement
    const conflicts = [];
    if (!solver.checkRowPlacement(puzzle, rowIndex, colIndex, value)) {
      conflicts.push("row");
    }
    if (!solver.checkColPlacement(puzzle, rowIndex, colIndex, value)) {
      conflicts.push("column");
    }
    if (!solver.checkRegionPlacement(puzzle, rowIndex, colIndex, value)) {
      conflicts.push("region");
    }

    // If there are conflicts, return them along with valid false
    if (conflicts.length > 0) {
      return res.json({ valid: false, conflict: conflicts });
    }

    // If all checks pass, placement is valid
    return res.json({ valid: true });
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;

    // Check if the request body contains puzzle
    if (!puzzle) {
      return res.json({ error: "Required field missing" });
    }

    // Check if the puzzle contains only numbers and periods
    if (!/^[1-9.]+$/.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    // Check if the puzzle length is exactly 81 characters
    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    // Solve the puzzle
    const solution = solver.solve(puzzle);

    if (solution === false) {
      return res.json({ error: "Puzzle cannot be solved" });
    }

    // Return the solved puzzle
    return res.json({ solution });
  });
};
