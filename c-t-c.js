/* -------------------- CATCH GAME -------------------- */
let catchGameLevel = 1;
let catchGameCaught = 0;
let catchGameRequired = 10;
let catchGamePlayerX = 150;
let catchGameItems = [];
let catchGameDropInterval = null;
let catchGameDropSpeed = 2;
let catchGameCanvas = null;
let catchGameCtx = null;
let catchGameIsActive = false;

const catchGamePetFoodMap = {
  "🐶": "🦴",
  "🐱": "🐟",
  "🐰": "🥕",
  "🐻": "🍯",
  "🦁": "🥩",
  "🐭": "🧀"
};

const catchGameBadEmojis = ["💣", "💀", "💩"];

function startCatchGame() {
  if (!selectedEmoji || hasRunAway) {
    GameError.showError("Please select a pet first or reset the game!");
    return;
  }
  
  if (energy < 10) {
    GameError.showError("Your pet needs more energy!");
    return;
  }

  cleanupGames();
  document.querySelector('.miniGameHeader').style.display = 'none';
  
  setMiniGameContent(`
    <div id="catchGameScreen" style="position: relative; width: 100%; height: 100%; text-align: center; overflow: hidden;">
      <h3 id="catchGameCountdown">GET READY!!</h3>
      <canvas id="catchGameCanvas" width="400" height="400" style="background: #222; display: block; margin: 0 auto; max-width: 100%; max-height: 70vh;"></canvas>
      <div id="catchGameMessage" 
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        font-size: 24px; color: white; background-color: rgba(0, 0, 0, 0.8); 
        padding: 20px; border-radius: 10px; display: none; z-index: 1000;">
      </div>
    </div>
  `);

  document.getElementById("catchGameMessage").textContent = "";
  runCatchCountdown();
}

function runCatchCountdown() {
  const countdownElement = document.getElementById("catchGameCountdown");
  let count = 3;
  countdownElement.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownElement.textContent = count;
    } else if (count === 0) {
      countdownElement.textContent = "GO!";
    } else {
      clearInterval(interval);
      countdownElement.style.display = "none";
      startCatchGameLoop();
    }
  }, 1000);
}

function startCatchGameLoop() {
  catchGameCanvas = document.getElementById("catchGameCanvas");
  catchGameCtx = catchGameCanvas.getContext("2d");
  
  catchGameCaught = 0;
  catchGameItems = [];
  catchGamePlayerX = catchGameCanvas.width / 2;
  catchGameIsActive = true;
  catchGameRequired = 5 + (catchGameLevel * 3);
  catchGameDropSpeed = 2 + (catchGameLevel - 1) * 0.5;

  // Fixed mouse movement with proper scaling
  catchGameCanvas.addEventListener('mousemove', (e) => {
    const rect = catchGameCanvas.getBoundingClientRect();
    const scaleX = catchGameCanvas.width / rect.width;
    const scaleY = catchGameCanvas.height / rect.height;
    catchGamePlayerX = Math.max(18, Math.min((e.clientX - rect.left) * scaleX, catchGameCanvas.width - 18));
  });

  // Fixed touch movement with proper scaling
  catchGameCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = catchGameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = catchGameCanvas.width / rect.width;
    catchGamePlayerX = Math.max(18, Math.min((touch.clientX - rect.left) * scaleX, catchGameCanvas.width - 18));
  }, { passive: false });

  startCatchDropInterval();
  requestAnimationFrame(runCatchGameLoop);
}

function startCatchDropInterval() {
  if (catchGameDropInterval) clearInterval(catchGameDropInterval);

  const intervalTime = Math.max(1000 - (catchGameLevel - 1) * 100, 500);

  catchGameDropInterval = setInterval(() => {
    if (!catchGameIsActive) return;

    const isGood = Math.random() < 0.7;
    let emoji;
    
    if (isGood) {
      emoji = catchGamePetFoodMap[selectedEmoji] || "🍬";
    } else {
      emoji = catchGameBadEmojis[Math.floor(Math.random() * catchGameBadEmojis.length)];
    }

    catchGameItems.push({
      emoji: emoji,
      x: Math.random() * (catchGameCanvas.width - 30) + 15,
      y: -30,
      isGood: isGood
    });
  }, intervalTime);
}

function runCatchGameLoop() {
  if (!catchGameIsActive) return;

  catchGameCtx.clearRect(0, 0, catchGameCanvas.width, catchGameCanvas.height);

  // Draw UI
  catchGameCtx.fillStyle = "#fff";
  catchGameCtx.font = "16px Arial";
  catchGameCtx.fillText(`Level: ${catchGameLevel}`, 10, 20);
  catchGameCtx.fillText(`Caught: ${catchGameCaught}/${catchGameRequired}`, 10, 40);

  // Update items
  for (let i = 0; i < catchGameItems.length; i++) {
    let item = catchGameItems[i];
    item.y += catchGameDropSpeed;

    catchGameCtx.font = "24px serif";
    catchGameCtx.fillText(item.emoji, item.x, item.y);

    // Collision detection
    if (item.y > catchGameCanvas.height - 40 && Math.abs(item.x - catchGamePlayerX) < 30) {
      if (item.isGood) {
        catchGameCaught++;
      } else {
        endCatchGame(false);
        return;
      }
      catchGameItems.splice(i, 1);
      i--;
    }
  }

  // Remove items that fell off screen
  catchGameItems = catchGameItems.filter(item => item.y < catchGameCanvas.height + 30);

  // Draw player
  catchGameCtx.font = "36px serif";
  catchGameCtx.fillText(selectedEmoji || "🐶", catchGamePlayerX - 18, catchGameCanvas.height - 10);

  // Check win condition
  if (catchGameCaught >= catchGameRequired) {
    endCatchGame(true);
    return;
  }
  
  requestAnimationFrame(runCatchGameLoop);
}

function endCatchGame(success) {
  catchGameIsActive = false;
  clearInterval(catchGameDropInterval);

  const messageEl = document.getElementById("catchGameMessage");
  if (!messageEl) return;

  messageEl.style.display = "block";
  messageEl.innerHTML = `
    <p style="margin-bottom: 20px; font-size: 1.2em;">
      ${success ? `🎉 Level ${catchGameLevel} Completed!` : `💥 You caught a bad emoji! Try Again!`}
    </p>
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startCatchGame()">
        🔁 ${success ? "Next Level" : "Try Again"}
      </button>
      <button onclick="exitMiniGame()">
        🔙 Back
      </button>
    </div>
  `;

  if (success) {
    catchGameLevel++;
    happiness = Math.min(happiness + 20, 100);
    xp += 10;
  } else {
    energy = Math.max(energy - 10, 0);
  }
  
  updateStatus();
  checkLevelUp();
  saveGameState();
}

/* -------------------- INITIALIZATION -------------------- */
// Prevent space bar from scrolling page
document.addEventListener('keydown', function(e) {
  if(e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
  }
});

// Initialize game on page load
window.addEventListener('DOMContentLoaded', () => {
  // Always start with pet selection screen hidden and main game hidden
  document.getElementById("petSelectScreen").style.display = "block";
  document.getElementById("mainPlane").style.display = "none";
  document.getElementById("miniGameContainer").style.display = "none";
  
  // Try to load saved state
  if (loadGameState() && selectedEmoji) {
    document.getElementById("petSelectScreen").style.display = "none";
    document.getElementById("mainPlane").style.display = "flex";
    document.getElementById("petDisplay").textContent = selectedEmoji;
    updateStatus();
  }
});

// Auto-save every 30 seconds
setInterval(saveGameState, 30000);



/* -------------------- CSS STYLES -------------------- */
const additionalCSS = `
  /* Prevent scroll bars in mini-games */
  #miniGameContainer {
    overflow: hidden !important;
  }
  
  #miniGameContent {
    overflow: hidden !important;
    max-height: 80vh;
  }
  
  #catchGameScreen, #jumpGameScreen {
    overflow: hidden !important;
  }
  
  canvas {
    max-width: 100% !important;
    max-height: 70vh !important;
    object-fit: contain;
  }
`;

// Add the CSS to the document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

