/* -------------------- MINI-GAME MANAGEMENT -------------------- */
function cleanupGames() {
  // Clear any existing intervals
  if (window.jumpGameInterval) clearInterval(window.jumpGameInterval);
  if (window.catchGameDropInterval) clearInterval(window.catchGameDropInterval);
  
  // Reset game states
  window.jumpGameRunning = false;
  window.catchGameIsActive = false;
  
  // Remove event listeners
  document.removeEventListener("keydown", handleJumpGameKey);
  const canvas = document.getElementById("jumpGameCanvas");
  if (canvas) {
    canvas.removeEventListener("touchstart", handleJumpGameTouch);
  }
}

function openMiniGameSession() {
  document.getElementById("mainPlane").style.display = "none";
  document.getElementById("miniGameContainer").style.display = "flex";
  showMiniGameSelection();
}

function exitMiniGame() {
  document.querySelector('.miniGameHeader').style.display = 'block';
  document.getElementById("miniGameContainer").style.display = "none";
  document.getElementById("mainPlane").style.display = "flex";
  document.getElementById("miniGameMessage").textContent = "";
  setMiniGameContent("");
  cleanupGames();
}

function showMiniGameSelection() {
  setMiniGameContent(`
    <div class="gameSelectMenu">
      <button onclick="startJumpGame()" class="game-choice">
        <span class="game-icon">🎾</span>
        <div class="game-info">
          <div class="game-title">Jump the Jump</div>
          <div class="game-desc">Help your pet avoid obstacles and gaps!</div>
        </div>
      </button>
      <button onclick="startCatchGame()" class="game-choice">
        <span class="game-icon">🍬</span>
        <div class="game-info">
          <div class="game-title">Catch the Treat</div>
          <div class="game-desc">Catch treats and avoid bad items!</div>
        </div>
      </button>
      <button onclick="startTicTacToe()" class="game-choice">
        <span class="game-icon">⌗</span>
        <div class="game-info">
          <div class="game-title">Tic-Tac-Toe</div>
          <div class="game-desc">Battle the skull! Can you win?</div>
        </div>
      </button>
    </div>
  `);
  document.getElementById("miniGameMessage").textContent = "Choose a mini-game!";
}


