const test = require("node:test");
const assert = require("node:assert/strict");
const { createBoard, neighbors, reveal } = require("../minesweeper.js");
const random = () => 0.42;
test("first move and neighboring cells are safe; all counts match the mines", () => {
  const board = createBoard(8, 10, 27, random);
  assert.equal(board.cells.filter((cell) => cell.mine).length, 10);
  for (const index of [27, ...neighbors(27, 8)])
    assert.equal(board.cells[index].mine, false);
  board.cells.forEach((cell, index) =>
    assert.equal(
      cell.count,
      neighbors(index, 8).filter((i) => board.cells[i].mine).length,
    ),
  );
});
test("empty-cell flood fill leaves flagged cells covered", () => {
  const board = createBoard(8, 10, 27, random);
  board.cells[28].flagged = true;
  assert.equal(reveal(board, 27), "playing");
  assert.equal(board.cells[27].revealed, true);
  assert.equal(board.cells[28].revealed, false);
  assert.ok(board.cells.filter((cell) => cell.revealed).length > 1);
});
test("revealing a mine loses; revealing every safe cell wins", () => {
  const lost = createBoard(8, 10, 27, random);
  assert.equal(
    reveal(
      lost,
      lost.cells.findIndex((cell) => cell.mine),
    ),
    "lost",
  );
  const won = createBoard(8, 10, 27, random);
  let result;
  won.cells.forEach((cell, index) => {
    if (!cell.mine && !cell.revealed) result = reveal(won, index);
  });
  assert.equal(result, "won");
});
