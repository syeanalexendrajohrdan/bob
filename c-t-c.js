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
let catchGameMouseHandler = null;
let catchGameTouchHandler = null;

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
  if (!catchGameCanvas) {
    GameError.showError("Canvas not found!");
    return;
  }
  
  catchGameCtx = catchGameCanvas.getContext("2d");
  
  // Reset game state
  catchGameCaught = 0;
  catchGameItems = [];
  catchGamePlayerX = catchGameCanvas.width / 2;
  catchGameIsActive = true;
  catchGameRequired = 5 + (catchGameLevel * 3);
  catchGameDropSpeed = 2 + (catchGameLevel - 1) * 0.5;

  // Remove old event listeners first
  if (catchGameMouseHandler) {
    catchGameCanvas.removeEventListener('mousemove', catchGameMouseHandler);
  }
  if (catchGameTouchHandler) {
    catchGameCanvas.removeEventListener('touchmove', catchGameTouchHandler);
  }

  // Fixed mouse movement with proper scaling
  catchGameMouseHandler = (e) => {
    if (!catchGameIsActive) return;
    const rect = catchGameCanvas.getBoundingClientRect();
    const scaleX = catchGameCanvas.width / rect.width;
    catchGamePlayerX = Math.max(25, Math.min((e.clientX - rect.left) * scaleX, catchGameCanvas.width - 25));
  };
  catchGameCanvas.addEventListener('mousemove', catchGameMouseHandler);

  // Fixed touch movement with proper scaling
  catchGameTouchHandler = (e) => {
    if (!catchGameIsActive) return;
    e.preventDefault();
    const rect = catchGameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = catchGameCanvas.width / rect.width;
    catchGamePlayerX = Math.max(25, Math.min((touch.clientX - rect.left) * scaleX, catchGameCanvas.width - 25));
  };
  catchGameCanvas.addEventListener('touchmove', catchGameTouchHandler, { passive: false });

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
  if (!catchGameIsActive || !catchGameCanvas || !catchGameCtx) return;

  catchGameCtx.clearRect(0, 0, catchGameCanvas.width, catchGameCanvas.height);

  // Draw UI
  catchGameCtx.fillStyle = "#fff";
  catchGameCtx.font = "bold 18px Arial";
  catchGameCtx.fillText(`Level: ${catchGameLevel}`, 10, 25);
  catchGameCtx.fillText(`Caught: ${catchGameCaught}/${catchGameRequired}`, 10, 50);

  // Update items
  for (let i = catchGameItems.length - 1; i >= 0; i--) {
    let item = catchGameItems[i];
    item.y += catchGameDropSpeed;

    // Draw item
    catchGameCtx.font = "30px serif";
    catchGameCtx.fillText(item.emoji, item.x, item.y);

    // Improved collision detection
    const itemBottom = item.y;
    const playerTop = catchGameCanvas.height - 50;
    const horizontalDistance = Math.abs(item.x - catchGamePlayerX);
    
    if (itemBottom >= playerTop && itemBottom <= catchGameCanvas.height - 10 && horizontalDistance < 40) {
      if (item.isGood) {
        catchGameCaught++;
      } else {
        endCatchGame(false);
        return;
      }
      catchGameItems.splice(i, 1);
      continue;
    }

    // Remove items that fell off screen
    if (item.y > catchGameCanvas.height + 30) {
      catchGameItems.splice(i, 1);
    }
  }

  // Draw player
  catchGameCtx.font = "45px serif";
  catchGameCtx.fillText(selectedEmoji || "🐶", catchGamePlayerX - 22, catchGameCanvas.height - 10);

  // Check win condition
  if (catchGameCaught >= catchGameRequired) {
    endCatchGame(true);
    return;
  }
  
  requestAnimationFrame(runCatchGameLoop);
}

function endCatchGame(success) {
  catchGameIsActive = false;
  
  // Clear interval
  if (catchGameDropInterval) {
    clearInterval(catchGameDropInterval);
    catchGameDropInterval = null;
  }

  // Remove event listeners
  if (catchGameCanvas) {
    if (catchGameMouseHandler) {
      catchGameCanvas.removeEventListener('mousemove', catchGameMouseHandler);
      catchGameMouseHandler = null;
    }
    if (catchGameTouchHandler) {
      catchGameCanvas.removeEventListener('touchmove', catchGameTouchHandler);
      catchGameTouchHandler = null;
    }
  }

  document.querySelector('.miniGameHeader').style.display = 'flex';

  const messageEl = document.getElementById("catchGameMessage");
  if (!messageEl) return;

  messageEl.style.display = "block";
  messageEl.innerHTML = `
    <p style="margin-bottom: 20px; font-size: 1.3em; font-weight: bold;">
      ${success ? `🎉 Level ${catchGameLevel} Completed! 🎉` : `💥 Game Over! Try Again!`}
    </p>
    <p style="margin-bottom: 20px; font-size: 1em;">
      You caught ${catchGameCaught}/${catchGameRequired} items!
    </p>
    <div style="display: flex; justify-content: center; gap: 15px;">
      <button onclick="startCatchGame()" style="padding: 10px 20px; font-size: 1.1em; cursor: pointer; border: none; border-radius: 8px; background: linear-gradient(145deg, #4ecdc4, #45b7d1); color: white;">
        🔁 ${success ? "Next Level" : "Try Again"}
      </button>
      <button onclick="exitMiniGame()" style="padding: 10px 20px; font-size: 1.1em; cursor: pointer; border: none; border-radius: 8px; background: linear-gradient(145deg, #ff6b6b, #ee5a6f); color: white;">
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

