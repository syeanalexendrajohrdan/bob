/* -------------------- MINI-GAME MANAGEMENT -------------------- */
function cleanupGames() {
  // Clear catch game
  if (window.catchGameIsActive !== undefined) {
    window.catchGameIsActive = false;
  }
  if (window.catchGameDropInterval) {
    clearInterval(window.catchGameDropInterval);
    window.catchGameDropInterval = null;
  }
  
  // Remove catch game event listeners
  if (window.catchGameCanvas) {
    if (window.catchGameMouseHandler) {
      window.catchGameCanvas.removeEventListener('mousemove', window.catchGameMouseHandler);
      window.catchGameMouseHandler = null;
    }
    if (window.catchGameTouchHandler) {
      window.catchGameCanvas.removeEventListener('touchmove', window.catchGameTouchHandler);
      window.catchGameTouchHandler = null;
    }
  }
  
  // Clear jump game
  if (window.jumpGameInterval) {
    clearInterval(window.jumpGameInterval);
    window.jumpGameInterval = null;
  }
  
  // Reset game states
  if (window.jumpGameRunning !== undefined) {
    window.jumpGameRunning = false;
  }
  
  // Remove jump game event listeners
  document.removeEventListener("keydown", handleJumpGameKey);
  const jumpCanvas = document.getElementById("jumpGameCanvas");
  if (jumpCanvas) {
    jumpCanvas.removeEventListener("touchstart", handleJumpGameTouch);
  }
  
  // Clear items arrays
  if (window.catchGameItems) {
    window.catchGameItems = [];
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


