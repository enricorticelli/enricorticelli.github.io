(() => {
  function neighbors(index, size) {
    const row = Math.floor(index / size),
      column = index % size,
      result = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const y = row + dy,
          x = column + dx;
        if ((dx || dy) && y >= 0 && y < size && x >= 0 && x < size)
          result.push(y * size + x);
      }
    return result;
  }
  function createBoard(size, mineCount, firstIndex, random = Math.random) {
    const safe = new Set([firstIndex, ...neighbors(firstIndex, size)]);
    const choices = Array.from({ length: size * size }, (_, i) => i).filter(
      (i) => !safe.has(i),
    );
    if (mineCount > choices.length)
      throw new RangeError("Too many mines for a safe first move");
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    const mines = new Set(choices.slice(0, mineCount));
    const cells = Array.from({ length: size * size }, (_, i) => ({
      mine: mines.has(i),
      revealed: false,
      flagged: false,
      count: neighbors(i, size).filter((n) => mines.has(n)).length,
    }));
    return { size, cells };
  }
  function reveal(board, index) {
    const first = board.cells[index];
    if (!first || first.flagged || first.revealed) return "playing";
    if (first.mine) {
      first.revealed = true;
      return "lost";
    }
    const queue = [index];
    while (queue.length) {
      const cellIndex = queue.pop(),
        cell = board.cells[cellIndex];
      if (cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      if (!cell.count) queue.push(...neighbors(cellIndex, board.size));
    }
    return board.cells.every((cell) => cell.mine || cell.revealed)
      ? "won"
      : "playing";
  }
  function mount(body) {
    const SIZE = 8,
      MINE_COUNT = 10;
    let board,
      flags,
      ended,
      elapsed,
      timer,
      flagMode = false;
    const game = document.createElement("div");
    game.className = "minesweeper";
    const toolbar = document.createElement("div");
    toolbar.className = "mine-menubar";
    const newGame = document.createElement("button");
    newGame.type = "button";
    newGame.textContent = "Partita";
    const flagButton = document.createElement("button");
    flagButton.type = "button";
    flagButton.textContent = "⚑";
    flagButton.setAttribute("aria-label", "Modalità bandiera");
    toolbar.append(newGame, flagButton);
    const header = document.createElement("div");
    header.className = "mine-header";
    const remaining = document.createElement("span");
    remaining.className = "mine-counter";
    const face = document.createElement("button");
    face.type = "button";
    face.className = "mine-face";
    face.setAttribute("aria-label", "Nuova partita");
    const clock = document.createElement("span");
    clock.className = "mine-counter";
    clock.setAttribute("aria-label", "Secondi di gioco");
    header.append(remaining, face, clock);
    const grid = document.createElement("div");
    grid.className = "mine-grid";
    const message = document.createElement("div");
    message.className = "mine-message";
    message.setAttribute("aria-live", "polite");
    const buttons = Array.from({ length: SIZE * SIZE }, (_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mine-cell";
      button.addEventListener("click", () =>
        flagMode ? toggleFlag(index) : play(index),
      );
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleFlag(index);
      });
      grid.append(button);
      return button;
    });
    game.append(toolbar, header, grid, message);
    body.append(game);
    function render() {
      remaining.textContent = String(
        Math.max(0, MINE_COUNT - flags.size),
      ).padStart(3, "0");
      clock.textContent = String(Math.min(999, elapsed)).padStart(3, "0");
      flagButton.setAttribute("aria-pressed", String(flagMode));
      buttons.forEach((button, index) => {
        const cell = board?.cells[index],
          isMine = ended === "lost" && cell?.mine;
        button.classList.toggle("revealed", !!cell?.revealed || isMine);
        button.classList.toggle("mine-hit", isMine && cell.revealed);
        button.dataset.number = cell?.revealed ? String(cell.count) : "";
        button.textContent = isMine
          ? "✹"
          : flags.has(index)
            ? "⚑"
            : cell?.revealed && cell.count
              ? cell.count
              : "";
        button.disabled = !!ended || !!cell?.revealed;
        button.setAttribute(
          "aria-label",
          `Riga ${Math.floor(index / SIZE) + 1}, colonna ${(index % SIZE) + 1}: ${isMine ? "mina" : flags.has(index) ? "bandiera" : cell?.revealed ? `${cell.count} mine vicine` : "coperta"}`,
        );
      });
    }
    function reset() {
      clearInterval(timer);
      board = null;
      flags = new Set();
      ended = null;
      elapsed = 0;
      face.textContent = ":)";
      message.textContent = "10 mine. Il primo click è sicuro.";
      render();
    }
    function toggleFlag(index) {
      if (ended || board?.cells[index].revealed) return;
      if (flags.has(index)) flags.delete(index);
      else if (flags.size < MINE_COUNT) flags.add(index);
      if (board) board.cells[index].flagged = flags.has(index);
      render();
    }
    function play(index) {
      if (ended || flags.has(index)) return;
      if (!board) {
        board = createBoard(SIZE, MINE_COUNT, index);
        flags.forEach((flag) => {
          board.cells[flag].flagged = true;
        });
        timer = setInterval(() => {
          elapsed++;
          render();
        }, 1000);
      }
      const result = reveal(board, index);
      if (result !== "playing") {
        ended = result;
        clearInterval(timer);
        face.textContent = result === "won" ? "8)" : ":(";
        message.textContent =
          result === "won"
            ? "Hai vinto! Tutto il campo è al sicuro."
            : "Hai trovato una mina. Premi la faccina e riprova.";
      } else message.textContent = "Tasto destro o ⚑ per mettere una bandiera.";
      render();
    }
    newGame.addEventListener("click", reset);
    face.addEventListener("click", reset);
    flagButton.addEventListener("click", () => {
      flagMode = !flagMode;
      render();
    });
    reset();
    return () => clearInterval(timer);
  }
  const api = { neighbors, createBoard, reveal, mount };
  globalThis.EnricoMinesweeper = api;
  if (typeof module !== "undefined") module.exports = api;
})();
