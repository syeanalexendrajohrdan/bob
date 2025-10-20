/* -------------------- TIC-TAC-TOE GAME -------------------- */
let tttBoard = ["", "", "", "", "", "", "", "", ""];
let tttGameActive = false;
let tttPlayerSymbol = "";
let tttComputerSymbol = "💀";

function startTicTacToe() {
  if (!selectedEmoji) {
    GameError.showError("Please select a pet first!");
    return;
  }

  if (hasRunAway) {
    GameError.showError("Your pet has run away! Reset the game first.");
    return;
  }

  document.querySelector('.miniGameHeader').style.display = 'none';
  
  tttBoard = ["", "", "", "", "", "", "", "", ""];
  tttGameActive = true;
  tttPlayerSymbol = selectedEmoji;

  setMiniGameContent(`
    <div id="tttGameScreen" style="text-align: center; padding: 20px;">
      <h3 style="margin-bottom: 20px; color: #fff;">You vs 💀</h3>
      <div id="tttBoard" style="
        display: grid;
        grid-template-columns: repeat(3, 100px);
        grid-template-rows: repeat(3, 100px);
        gap: 10px;
        margin: 20px auto;
        justify-content: center;
      ">
        ${Array(9).fill(0).map((_, i) => `
          <button 
            id="tttCell${i}" 
            onclick="makePlayerMove(${i})"
            style="
              width: 100px;
              height: 100px;
              font-size: 3em;
              background: linear-gradient(145deg, #2a2a3a, #1a1a2a);
              border: 2px solid #444;
              border-radius: 15px;
              cursor: pointer;
              transition: all 0.3s ease;
              color: white;
            "
            onmouseover="this.style.background='linear-gradient(145deg, #3a3a4a, #2a2a3a)'; this.style.transform='scale(1.05)'"
            onmouseout="this.style.background='linear-gradient(145deg, #2a2a3a, #1a1a2a)'; this.style.transform='scale(1)'"
          ></button>
        `).join('')}
      </div>
      <p id="tttMessage" style="font-size: 1.2em; color: #ffd93d; margin-top: 20px;">Your turn! Click a cell.</p>
    </div>
  `);

  document.getElementById("miniGameMessage").textContent = "";
}

function makePlayerMove(index) {
  if (!tttGameActive || tttBoard[index] !== "") return;

  // Player makes move
  tttBoard[index] = tttPlayerSymbol;
  document.getElementById(`tttCell${index}`).textContent = tttPlayerSymbol;
  document.getElementById(`tttCell${index}`).style.cursor = "not-allowed";

  // Check if player won
  if (checkTTTWinner(tttPlayerSymbol)) {
    endTicTacToe(true);
    return;
  }

  // Check for draw
  if (tttBoard.every(cell => cell !== "")) {
    endTicTacToe(null);
    return;
  }

  // Computer's turn
  document.getElementById("tttMessage").textContent = "💀 is thinking...";
  setTimeout(() => {
    makeComputerMove();
  }, 500);
}

function makeComputerMove() {
  if (!tttGameActive) return;

  // AI Strategy: Try to win, then block, then take center, then take corner, then take any
  let move = findBestMove();
  
  tttBoard[move] = tttComputerSymbol;
  document.getElementById(`tttCell${move}`).textContent = tttComputerSymbol;
  document.getElementById(`tttCell${move}`).style.cursor = "not-allowed";

  // Check if computer won
  if (checkTTTWinner(tttComputerSymbol)) {
    endTicTacToe(false);
    return;
  }

  // Check for draw
  if (tttBoard.every(cell => cell !== "")) {
    endTicTacToe(null);
    return;
  }

  document.getElementById("tttMessage").textContent = "Your turn! Click a cell.";
}

function findBestMove() {
  // 1. Try to win
  for (let i = 0; i < 9; i++) {
    if (tttBoard[i] === "") {
      tttBoard[i] = tttComputerSymbol;
      if (checkTTTWinner(tttComputerSymbol)) {
        tttBoard[i] = "";
        return i;
      }
      tttBoard[i] = "";
    }
  }

  // 2. Block player from winning
  for (let i = 0; i < 9; i++) {
    if (tttBoard[i] === "") {
      tttBoard[i] = tttPlayerSymbol;
      if (checkTTTWinner(tttPlayerSymbol)) {
        tttBoard[i] = "";
        return i;
      }
      tttBoard[i] = "";
    }
  }

  // 3. Take center if available
  if (tttBoard[4] === "") return 4;

  // 4. Take a corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => tttBoard[i] === "");
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 5. Take any available space
  const availableSpaces = tttBoard.map((cell, idx) => cell === "" ? idx : null).filter(idx => idx !== null);
  return availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
}

function checkTTTWinner(symbol) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  return winPatterns.some(pattern => 
    pattern.every(index => tttBoard[index] === symbol)
  );
}

function endTicTacToe(playerWon) {
  tttGameActive = false;
  document.querySelector('.miniGameHeader').style.display = 'flex';

  // Disable all cells
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById(`tttCell${i}`);
    if (cell) cell.style.cursor = "not-allowed";
  }

  if (playerWon === true) {
    // Player won
    happiness = Math.min(happiness + 25, 100);
    xp += 15;
    document.getElementById("tttMessage").textContent = "🎉 YOU WON! Great job!";
    setTimeout(() => {
      document.getElementById("miniGameMessage").innerHTML = `
        <p style="margin-bottom: 20px; font-size: 1.2em;">
          🎉 Victory! You defeated the skull!
        </p>
        <div style="display: flex; justify-content: center; gap: 10px;">
          <button onclick="startTicTacToe()">🔁 Play Again</button>
          <button onclick="exitMiniGame()">🔙 Back</button>
        </div>
      `;
    }, 1500);
  } else if (playerWon === false) {
    // Computer won
    energy = Math.max(energy - 10, 0);
    document.getElementById("tttMessage").textContent = "💀 The skull won! Try again!";
    setTimeout(() => {
      document.getElementById("miniGameMessage").innerHTML = `
        <p style="margin-bottom: 20px; font-size: 1.2em;">
          💀 The skull defeated you! Want revenge?
        </p>
        <div style="display: flex; justify-content: center; gap: 10px;">
          <button onclick="startTicTacToe()">🔁 Try Again</button>
          <button onclick="exitMiniGame()">🔙 Back</button>
        </div>
      `;
    }, 1500);
  } else {
    // Draw
    happiness = Math.min(happiness + 10, 100);
    xp += 5;
    document.getElementById("tttMessage").textContent = "🤝 It's a draw!";
    setTimeout(() => {
      document.getElementById("miniGameMessage").innerHTML = `
        <p style="margin-bottom: 20px; font-size: 1.2em;">
          🤝 It's a tie! Play again?
        </p>
        <div style="display: flex; justify-content: center; gap: 10px;">
          <button onclick="startTicTacToe()">🔁 Play Again</button>
          <button onclick="exitMiniGame()">🔙 Back</button>
        </div>
      `;
    }, 1500);
  }

  updateStatus();
  checkLevelUp();
  saveGameState();
}