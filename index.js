/* -------------------- HELPERS -------------------- */
function setMiniGameContent(html) {
  document.getElementById("miniGameContent").innerHTML = html;
}

function setRandomMessage(messageArray) {
  const moodElement = document.getElementById("petMood");
  if (messageArray && messageArray.length > 0) {
    moodElement.textContent = messageArray[Math.floor(Math.random() * messageArray.length)];
  } else {
    moodElement.textContent = "I'm here with you!";
  }
  moodElement.style.display = "block";
}

/* -------------------- GLOBAL STATE -------------------- */
let selectedEmoji = "";
let xp = 0, level = 1;
let hunger = 50, happiness = 50, energy = 50;
let hasRunAway = false;

/* -------------------- ERROR HANDLING -------------------- */
const GameError = {
  showError: (message) => {
    console.error(`[Game Error]: ${message}`);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'game-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: rgba(255, 0, 0, 0.9); color: white; padding: 10px 20px;
      border-radius: 5px; z-index: 9999; animation: fadeInOut 3s ease-in-out;
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }
};

/* -------------------- SAVE/LOAD FUNCTIONS -------------------- */
function saveGameState() {
  const gameState = {
    selectedEmoji,
    xp,
    level,
    hunger,
    happiness,
    energy,
    hasRunAway,
    lastSaved: Date.now()
  };
  
  try {
    localStorage.setItem('virtualPetGame', JSON.stringify(gameState));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

function loadGameState() {
  try {
    const saved = localStorage.getItem('virtualPetGame');
    if (saved) {
      const state = JSON.parse(saved);
      
      selectedEmoji = state.selectedEmoji || "";
      xp = state.xp || 0;
      level = state.level || 1;
      hunger = state.hunger || 50;
      happiness = state.happiness || 50;
      energy = state.energy || 50;
      hasRunAway = state.hasRunAway || false;
      
      return !!selectedEmoji;
    }
  } catch (e) {
    console.error('Failed to load game state:', e);
  }
  return false;
}

/* -------------------- PET SELECTION -------------------- */
function selectPet(emoji) {
  selectedEmoji = emoji;
  hasRunAway = false;
  
  // Hide select screen, show main game
  document.getElementById("petSelectScreen").style.display = "none";
  document.getElementById("mainPlane").style.display = "flex";
  
  // Initialize stats
  hunger = 50;
  happiness = 50;
  energy = 50;
  xp = 0;
  level = 1;
  
  // Update UI
  document.getElementById("petDisplay").textContent = selectedEmoji;
  updateStatus();
  saveGameState();
}

/* -------------------- PET ACTIONS -------------------- */
function feedPet() {
  if (!selectedEmoji) {
    GameError.showError("Please select a pet first!");
    return;
  }
  if (hasRunAway) {
    setRandomMessage(["Your pet has run away! 😢"]);
    return;
  }
  
  hunger = Math.min(hunger + 20, 100);
  energy = Math.min(energy + 10, 100);
  xp += 5;
  
  setRandomMessage([
    "Yum! Thank you!", 
    "So tasty!", 
    "I love this food!"
  ]);
  
  updateStatus();
  checkLevelUp();
  saveGameState();
}

function petPet() {
  if (!selectedEmoji) {
    GameError.showError("Please select a pet first!");
    return;
  }
  if (hasRunAway) {
    setRandomMessage(["Your pet has run away! 😢"]);
    return;
  }
  
  happiness = Math.min(happiness + 20, 100);
  xp += 5;
  
  setRandomMessage([
    "I love you!", 
    "That feels nice!", 
    "You're the best!"
  ]);
  
  updateStatus();
  checkLevelUp();
  saveGameState();
}

function playPet() {
  if (!selectedEmoji) {
    GameError.showError("Please select a pet first!");
    return;
  }
  if (hasRunAway) {
    setRandomMessage(["Your pet has run away! 😢"]);
    return;
  }
  
  if (energy >= 10) {
    happiness = Math.min(happiness + 15, 100);
    energy = Math.max(energy - 10, 0);
    hunger = Math.max(hunger - 10, 0);
    xp += 5;
    
    setRandomMessage([
      "Yay! That was fun!", 
      "Let's play again!", 
      "I loved playing!"
    ]);
  } else {
    setRandomMessage([
      "I'm too tired to play!", 
      "Let me rest first!"
    ]);
  }
  
  updateStatus();
  checkLevelUp();
  saveGameState();
}

function cleanPet() {
  if (!selectedEmoji) {
    GameError.showError("Please select a pet first!");
    return;
  }
  if (hasRunAway) {
    setRandomMessage(["Your pet has run away! 😢"]);
    return;
  }
  
  if (energy >= 5) {
    happiness = Math.min(happiness + 20, 100);
    energy = Math.max(energy - 5, 0);
    xp += 5;
    
    setRandomMessage([
      "I'm so clean now!", 
      "Thanks for the bath!", 
      "I love being fresh!"
    ]);
  } else {
    setRandomMessage([
      "I'm too tired to clean!", 
      "Let me rest first!"
    ]);
  }
  
  updateStatus();
  checkLevelUp();
  saveGameState();
}

function restPet() {
  if (!selectedEmoji) {
    GameError.showError("Please select a pet first!");
    return;
  }
  if (hasRunAway) {
    setRandomMessage(["Your pet has run away! 😢"]);
    return;
  }
  
  if (hunger >= 10) {
    energy = Math.min(energy + 30, 100);
    hunger = Math.max(hunger - 10, 0);
    xp += 5;
    
    setRandomMessage([
      "Zzz ... Feeling rested!", 
      "Ahh, that nap was great!", 
      "I feel much better now!"
    ]);
  } else {
    setRandomMessage([
      "I am too hungry to rest!", 
      "Feed me first, please!"
    ]);
  }
  
  updateStatus();
  checkLevelUp();
  saveGameState();
}

/* -------------------- STATUS & LEVEL -------------------- */
function updateStatus() {
  if (!selectedEmoji) return;

  // Update progress bars
  document.getElementById("hungerBar").value = hunger;
  document.getElementById("happinessBar").value = happiness;
  document.getElementById("energyBar").value = energy;
  
  // Update stat values
  document.getElementById("hungerValue").textContent = hunger;
  document.getElementById("happinessValue").textContent = happiness;
  document.getElementById("energyValue").textContent = energy;
  
  // Update level and XP
  document.getElementById("petLevel").textContent = `Level ${level} (XP: ${xp})`;
  
  // Update pet display
  document.getElementById("petDisplay").textContent = selectedEmoji;
  
  // Check if pet runs away
  if (hunger <= 0 || happiness <= 0 || energy <= 0) {
    hasRunAway = true;
    document.getElementById("petDisplay").textContent = "😢";
    setRandomMessage(["Your pet has run away!"]);
  }
}

function checkLevelUp() {
  const requiredXP = level * 50;
  if (xp >= requiredXP) {
    level += 1;
    xp -= requiredXP;
    setRandomMessage([
      `I leveled up to Level ${level}! 🎉`,
      `Yay! I'm now Level ${level}`,
      `Thanks! I'm Level ${level} now!`
    ]);
    
    // Play level up animation
    const levelBadge = document.getElementById("petLevel");
    levelBadge.style.animation = "none";
    levelBadge.offsetHeight; // Trigger reflow
    levelBadge.style.animation = "pulse 2s infinite ease-in-out";
  }
  
  // Always update the XP display
  document.getElementById("petLevel").textContent = `Level ${level} (XP: ${xp})`;
}

function resetGame() {
  // Reset all stats
  selectedEmoji = "";
  xp = 0;
  level = 1;
  hunger = 50;
  happiness = 50;
  energy = 50;
  hasRunAway = false;
  
  // Reset UI
  document.getElementById("petSelectScreen").style.display = "block";
  document.getElementById("mainPlane").style.display = "none";
  document.getElementById("miniGameContainer").style.display = "none";
  
  // Clear saved state
  localStorage.removeItem('virtualPetGame');
  
  // Clear any running games
  cleanupGames();
}

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
    </div>
  `);
  document.getElementById("miniGameMessage").textContent = "Choose a mini-game!";
}

/* -------------------- JUMP GAME -------------------- */
let jumpGameRunning = false;
let jumpGamePetX = 30;
let jumpGamePetY = 100;
let jumpGameJumpVelocity = 0;
let jumpGameIsJumping = false;
let jumpGameObstacles = [];
let jumpGameInterval;
let jumpGameTime = 0;

function startJumpGame() {
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
    <div id="jumpGameScreen" style="width: 100%; text-align: center;">
      <h3 id="jumpGameCountdown">GET READY!!</h3>
      <canvas id="jumpGameCanvas" width="400" height="200" style="background: #222;"></canvas>
    </div>
  `);

  document.getElementById("miniGameMessage").textContent = "";
  runJumpCountdown();
}

function runJumpCountdown() {
  const countdownElement = document.getElementById("jumpGameCountdown");
  let count = 3;
  countdownElement.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownElement.textContent = count;
    } else {
      countdownElement.textContent = "GO!";
      clearInterval(interval);
      setTimeout(() => {
        countdownElement.style.display = "none";
        startJumpGameLoop();
      }, 500);
    }
  }, 1000);
}

function startJumpGameLoop() {
  document.getElementById("miniGameMessage").textContent = "TAP or PRESS SPACE TO JUMP!";
  jumpGameRunning = true;
  jumpGamePetX = 40;
  jumpGamePetY = 100;
  jumpGameJumpVelocity = 0;
  jumpGameIsJumping = false;
  jumpGameObstacles = [];
  jumpGameTime = 0;

  generateObstacles();
  jumpGameInterval = setInterval(updateJumpGame, 50);
  document.addEventListener("keydown", handleJumpGameKey);
  document.getElementById("jumpGameCanvas").addEventListener("touchstart", handleJumpGameTouch);
}

function generateObstacles() {
  jumpGameObstacles = [];
  let nextX = 300;
  
  while (nextX < 2000) {
    const obstacleType = Math.random() < 0.5 ? "gap" : "block";
    jumpGameObstacles.push({
      x: nextX,
      type: obstacleType,
      width: 40,
      height: 30
    });
    nextX += 150 + Math.random() * 100;
  }
}

function handleJumpGameKey(e) {
  if (e.code === "Space" && !jumpGameIsJumping && jumpGameRunning) {
    e.preventDefault();
    jumpGameJumpVelocity = -8;
    jumpGameIsJumping = true;
  }
}

function handleJumpGameTouch() {
  if (!jumpGameIsJumping && jumpGameRunning) {
    jumpGameJumpVelocity = -8;
    jumpGameIsJumping = true;
  }
}

function updateJumpGame() {
  jumpGameTime += 50;
  if (jumpGameTime >= 15000) {
    endJumpGame(true);
    return;
  }

  const canvas = document.getElementById("jumpGameCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, 170, canvas.width, 30);

  // Update obstacles
  for (let i = jumpGameObstacles.length - 1; i >= 0; i--) {
    const obstacle = jumpGameObstacles[i];
    obstacle.x -= 3;

    if (obstacle.type === "gap") {
      ctx.clearRect(obstacle.x, 170, obstacle.width, 30);
    } else if (obstacle.type === "block") {
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(obstacle.x, 140, obstacle.width, 30);
    }

    if (obstacle.x < -obstacle.width) {
      jumpGameObstacles.splice(i, 1);
    }
  }

  // Physics
  if (jumpGameIsJumping) {
    jumpGamePetY += jumpGameJumpVelocity;
    jumpGameJumpVelocity += 0.5;
    
    if (jumpGamePetY >= 0) { // Changed from 100 to 0
      jumpGamePetY = 0;
      jumpGameIsJumping = false;
      jumpGameJumpVelocity = 0;
    }
  }

  // Draw pet - Fixed positioning to be ON the runway
  ctx.font = "40px serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(selectedEmoji || "🐶", jumpGamePetX, 170 - jumpGamePetY); // Fixed: subtract jumpGamePetY from ground level

  // Fixed collision detection
  for (const obstacle of jumpGameObstacles) {
    if (jumpGamePetX + 20 > obstacle.x && jumpGamePetX < obstacle.x + obstacle.width) {
      if (obstacle.type === "gap" && jumpGamePetY <= 5) { // Pet on ground and hits gap
        endJumpGame(false);
        return;
      } else if (obstacle.type === "block" && jumpGamePetY < 30) { // Pet not high enough to clear block
        endJumpGame(false);
        return;
      }
    }
  }
}

function endJumpGame(win) {
  clearInterval(jumpGameInterval);
  document.removeEventListener("keydown", handleJumpGameKey);
  const canvas = document.getElementById("jumpGameCanvas");
  if (canvas) {
    canvas.removeEventListener("touchstart", handleJumpGameTouch);
  }

  document.querySelector('.miniGameHeader').style.display = 'block';
  
  if (win) {
    happiness = Math.min(happiness + 30, 100);
    xp += 10;
    document.getElementById("miniGameMessage").textContent = "🎉 YOU WON! 🎉";
  } else {
    energy = Math.max(energy - 10, 0);
    document.getElementById("miniGameMessage").textContent = "💥 You Failed! Try Again!";
  }

  updateStatus();
  checkLevelUp();
  saveGameState();
  
  setTimeout(() => {
    document.getElementById("miniGameMessage").innerHTML = `
      <p style="margin-bottom: 20px; font-size: 1.2em;">
        ${win ? "🎉 You won! Want to play again?" : "😢 You lost! Try again?"}
      </p>
      <div style="display: flex; justify-content: center; gap: 10px;">
        <button onclick="startJumpGame()">✅ Play Again</button>
        <button onclick="exitMiniGame()">❌ Back</button>
      </div>
    `;
  }, 2000);
}

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
  "🐻": "🍯"
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
      <canvas id="catchGameCanvas" width="400" height="300" style="background: #222; display: block; margin: 0 auto; max-width: 100%; max-height: 70vh;"></canvas>
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
