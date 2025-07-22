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
let hasRunAway = false

/* -------------------- PET SELECTION -------------------- */
function selectPet(emoji) {
  hasRunAway = false;
  selectedEmoji = emoji;
  document.getElementById("petSelectScreen").style.display = "none";
  document.getElementById("mainPlane").style.display = "flex";

  hunger = 50;
  happiness = 50;
  energy = 50;
  xp = 0;
  level = 1;

  document.getElementById("petDisplay").textContent = selectedEmoji;
  updateStatus();
}

/* -------------------- PET ACTIONS -------------------- */
function feedPet() {
  if (hasRunAway) return;
  xp += 5;
  hunger = Math.min(hunger + 20, 100);
  energy = Math.min(energy + 10, 100);
  setRandomMessage([
    "Yum! Thank you!", "So tasty!", "I love this!"
  ]);
  checkLevelUp();
  updateStatus();
}

function petPet() {
  if (hasRunAway) return;
  xp += 5;
  happiness = Math.min(happiness + 20, 100);
  setRandomMessage([
    "I love you!", "That feels nice!", "You're the best!"
  ]);
  checkLevelUp();
  updateStatus();
}

function playPet() {
  if (hasRunAway) return;
  xp += 5;
  if (energy >= 10) {
    happiness = Math.min(happiness + 15, 100);
    energy = Math.max(energy - 10, 0);
    hunger = Math.max(hunger - 10, 0);
    setRandomMessage([
      "Yay! That was fun!", "Let's play again!", "I loved playing!"
    ]);
  } else {
    setRandomMessage([
      "I am too tired to play!", "Let me rest first!"
    ]);
  }
  checkLevelUp();
  updateStatus();
}

function cleanPet() {
  if(hasRunAway) return;
  xp += 5;
  if (energy >= 5) {
    happiness = Math.min(happiness + 20, 100);
    energy = Math.max(energy - 5, 0);
    setRandomMessage([
      "I'm so clean now!", "Thanks for the bath!", "I love being fresh!"
    ]);
  } else {
    setRandomMessage([
      "I'm too tired to clean!", "Let me rest first!"
    ]);
  }
  checkLevelUp();
  updateStatus();
}

function restPet() {
  if(hasRunAway) return;
  if (hunger >= 10) {
    xp += 5;
    energy = Math.min(energy + 30, 100);
    hunger = Math.max(hunger - 10, 0);
    setRandomMessage([
      "Zzz ... Feeling rested!", "Ahh, that nap was great!", "I feel much better now!"
    ]);
  } else {
    setRandomMessage([
      "I am too hungry to rest!", "Feed me first, please!"
    ]);
  }
  checkLevelUp();
  updateStatus();
}

/* -------------------- STATUS & LEVEL -------------------- */
function updateStatus() {
  document.getElementById("hungerBar").value = hunger;
  document.getElementById("happinessBar").value = happiness;
  document.getElementById("energyBar").value = energy;

  document.getElementById("hungerValue").textContent = hunger;
  document.getElementById("happinessValue").textContent = happiness;
  document.getElementById("energyValue").textContent = energy;

  if (hunger === 0 || happiness === 0 || energy === 0) {
    hasRunAway = true;
    document.getElementById("petDisplay").textContent = "😭";
    document.getElementById("petMood").textContent = "Your pet ran away!";
    return;
  }

  document.getElementById("petDisplay").textContent = selectedEmoji;

  const minStat = Math.min(hunger, happiness, energy);

  if (minStat > 80) {
    setRandomMessage([
      "I'm feeling amazing!", "I love you!", "This is the best day!", "Yayyy! So Happy!"
    ]);
  } else if (minStat > 60) {
    setRandomMessage([
      "I'm feeling happy!", "I am doing great!", "Feeling Good!", "Thanks for caring!"
    ]);
  } else if (minStat > 40) {
    setRandomMessage([
      "I'm feeling okay.", "Just chilling.", "Let's do something?"
    ]);
  } else if (minStat > 20) {
    setRandomMessage([
      "I am getting worried...", "Can you make me happy?", "I feel a bit down."
    ]);
  } else {
    setRandomMessage([
      "I am so sad!", "Please help me!", "Feed me or play?"
    ]);
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
  }
  document.getElementById("petLevel").textContent = `Level ${level} (XP: ${xp})`;
}

/* -------------------- MINI-GAME MANAGEMENT -------------------- */
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
}

/* -------------------- JUMP THE JUMP GAME -------------------- */
let jumpGameRunning = false;
let jumpGamePetX = 30;
let jumpGamePetY = 100;
let jumpGameJumpVelocity = 0;
let jumpGameIsJumping = false;
let jumpGameObstacles = [];
let jumpGameInterval;
let jumpGameTime = 0;
let jumpGameAnimating = false;
let jumpGameAnimationFrame = 0;

function startJumpGame() {
  if (!selectedEmoji) {
    document.getElementById("miniGameMessage").textContent = "Please select a pet first!";
    return;
  }

  if (hunger === 0 || happiness === 0 || energy === 0) {
    document.getElementById("miniGameMessage").textContent = "Game Over! Reset first.";
    return;
  }

  document.querySelector('.miniGameHeader').style.display = 'none';

  const canvasWidth = Math.min(300, window.innerWidth - 40);
  const canvasHeight = 150;

  setMiniGameContent(`
    <div id="jumpGameScreen" style="width: 100%; text-align: center;">
      <h3 id="jumpGameCountdown">GET READY!!</h3>
      <canvas id="jumpGameCanvas" width="${canvasWidth}" height="${canvasHeight}" style="background: #222;"></canvas>
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
  jumpGamePetX = 30;
  jumpGamePetY = 100;
  jumpGameJumpVelocity = 0;
  jumpGameIsJumping = false;
  jumpGameObstacles = [];
  jumpGameTime = 0;
  jumpGameAnimating = false;
  jumpGameAnimationFrame = 0;

  // Generate initial obstacles
  generateObstacles();

  jumpGameInterval = setInterval(updateJumpGame, 50);
  document.addEventListener("keydown", handleJumpGameKey);
  document.getElementById("jumpGameCanvas").addEventListener("touchstart", handleJumpGameTouch);
}

function generateObstacles() {
  jumpGameObstacles = [];
  let nextX = 300;
  
  // Generate obstacles for the game duration
  while (nextX < 2000) {
    const obstacleType = Math.random() < 0.5 ? "gap" : "block";
    jumpGameObstacles.push({
      x: nextX,
      type: obstacleType,
      width: 30,
      height: 30
    });
    nextX += 150 + Math.random() * 100; // Random spacing between 150-250 pixels
  }
}

function handleJumpGameKey(e) {
  if (e.code === "Space" && !jumpGameIsJumping && jumpGameRunning) {
    e.preventDefault(); // Prevent page scrolling
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
  if (jumpGameTime >= 20000) {
    endJumpGame(true);
    return;
  }

  const canvas = document.getElementById("jumpGameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 120, 300, 30);

  // Move and draw obstacles (only if not animating death)
  if (!jumpGameAnimating) {
    for (let i = jumpGameObstacles.length - 1; i >= 0; i--) {
      const obstacle = jumpGameObstacles[i];
      obstacle.x -= 5;

      if (obstacle.type === "gap") {
        // Draw gap by clearing the ground
        ctx.clearRect(obstacle.x, 120, obstacle.width, obstacle.height);
      } else if (obstacle.type === "block") {
        // Draw block above ground
        ctx.fillStyle = "#d81b60";
        ctx.fillRect(obstacle.x, 90, obstacle.width, obstacle.height);
      }

      // Remove obstacles that are off screen
      if (obstacle.x < -obstacle.width) {
        jumpGameObstacles.splice(i, 1);
      }
    }
  } else {
    // Redraw obstacles in their current position during animation
    for (const obstacle of jumpGameObstacles) {
      if (obstacle.type === "gap") {
        ctx.clearRect(obstacle.x, 120, obstacle.width, obstacle.height);
      } else if (obstacle.type === "block") {
        ctx.fillStyle = "#d81b60";
        ctx.fillRect(obstacle.x, 90, obstacle.width, obstacle.height);
      }
    }
  }

  // Apply gravity and jump physics (only if not animating death)
  if (!jumpGameAnimating) {
    jumpGamePetY += jumpGameJumpVelocity;
    jumpGameJumpVelocity += 0.5;
    
    // Check if pet should land on ground
    if (jumpGamePetY >= 100) {
      jumpGamePetY = 100;
      jumpGameIsJumping = false;
      jumpGameJumpVelocity = 0;
    }
    
    // Check if pet should land on a block (only when falling down)
    if (jumpGameJumpVelocity >= 0) {
      for (const obstacle of jumpGameObstacles) {
        if (obstacle.type === "block" && 
            jumpGamePetX + 20 > obstacle.x && 
            jumpGamePetX < obstacle.x + obstacle.width && 
            jumpGamePetY >= 60 && 
            jumpGamePetY <= 90) {
          jumpGamePetY = 60; // Land on top of block
          jumpGameIsJumping = false;
          jumpGameJumpVelocity = 0;
          break;
        }
      }
    }
  }

  // Handle death animations
  if (jumpGameAnimating) {
    jumpGameAnimationFrame++;
    
    if (jumpGameAnimating === "falling") {
      // Falling animation - pet falls down into gap
      jumpGamePetY += 3;
      
      // Add rotation effect
      ctx.save();
      ctx.translate(jumpGamePetX + 15, jumpGamePetY);
      ctx.rotate(jumpGameAnimationFrame * 0.2);
      ctx.font = "30px serif";
      ctx.fillStyle = "#d81b60";
      ctx.fillText(selectedEmoji || "🐶", -15, 0);
      ctx.restore();
      
      // End animation after pet falls below screen
      if (jumpGamePetY > 180 || jumpGameAnimationFrame > 60) {
        endJumpGame(false);
        return;
      }
    } else if (jumpGameAnimating === "blocked") {
      // Blocked animation - pet bounces back and falls
      jumpGamePetX -= 2;
      jumpGamePetY += 2;
      
      // Add shake effect
      const shakeX = Math.sin(jumpGameAnimationFrame * 0.5) * 2;
      const shakeY = Math.cos(jumpGameAnimationFrame * 0.5) * 2;
      
      ctx.font = "30px serif";
      ctx.fillStyle = "#d81b60";
      ctx.fillText(selectedEmoji || "🐶", jumpGamePetX + shakeX, jumpGamePetY + shakeY);
      
      // End animation after bouncing back
      if (jumpGameAnimationFrame > 30) {
        endJumpGame(false);
        return;
      }
    }
  } else {
    // Normal pet drawing
    ctx.font = "30px serif";
    ctx.fillStyle = "#d81b60";
    ctx.fillText(selectedEmoji || "🐶", jumpGamePetX, jumpGamePetY);
  }

  // Collision detection (only if not already animating)
  if (!jumpGameAnimating) {
    for (const obstacle of jumpGameObstacles) {
      if (jumpGamePetX + 20 > obstacle.x && jumpGamePetX < obstacle.x + obstacle.width) {
        if (obstacle.type === "gap") {
          // Pet falls into gap
          if (jumpGamePetY >= 100) {
            jumpGameRunning = false;
            jumpGameAnimating = "falling";
            jumpGameAnimationFrame = 0;
            return;
          }
        } else if (obstacle.type === "block") {
          // Pet hits block from the side
          if (jumpGamePetY > 90 && jumpGamePetY >= 70) {
            jumpGameRunning = false;
            jumpGameAnimating = "blocked";
            jumpGameAnimationFrame = 0;
            return;
          }
        }
      }
    }
    
    // Check if pet should fall off a block
    if (jumpGamePetY === 60) { // Pet is on a block
      let onBlock = false;
      for (const obstacle of jumpGameObstacles) {
        if (obstacle.type === "block" && 
            jumpGamePetX + 10 > obstacle.x && 
            jumpGamePetX + 10 < obstacle.x + obstacle.width) {
          onBlock = true;
          break;
        }
      }
      
      // If pet is not on a block anymore, start falling
      if (!onBlock) {
        jumpGameIsJumping = true;
        jumpGameJumpVelocity = 1; // Start falling with small downward velocity
      }
    }
  }

  if (!jumpGameRunning && !jumpGameAnimating) return;
}

function endJumpGame(win) {
  clearInterval(jumpGameInterval);
  document.removeEventListener("keydown", handleJumpGameKey);
  document.getElementById("jumpGameCanvas").removeEventListener("touchstart", handleJumpGameTouch);

  document.getElementsByClassName("miniGameHeader")[0].style.display = "flex";
  
  if (win) {
    happiness = Math.min(happiness + 30, 100);
    energy = Math.min(energy + 20, 100);
    xp += 10;
    document.getElementById("miniGameMessage").textContent = "YOU WON! YOUR PET IS HAPPY!";
  } else {
    energy = Math.max(energy - 10, 0);
    document.getElementById("miniGameMessage").textContent = "You Fell! Your pet lost energy!";
  }

  updateStatus();
  checkLevelUp();
  jumpGameRunning = false;

// Show "Play again?" message
document.getElementById("miniGameMessage").innerHTML = `
  ${win ? "🎉 You won! Want to play again?" : "😢 You lost! Try again?"}
  <br><br>
  <button onclick="startJumpGame()" style="margin-right: 10px; padding: 5px 15px;">✅ Yes</button>
  <button onclick="exitMiniGame()" style="padding: 5px 15px;">❌ No</button>
`;
}

/* -------------------- CATCH THE TREAT GAME -------------------- */
// Core game state
let catchGameLevel = 1;
let catchGameCaught = 0;
let catchGameRequired = 10;

let catchGameFoodEmoji = "";
let catchGameBadEmojis = ["💣", "💀", "💩"];

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

function setCatchGameFoodEmoji() {
  catchGameFoodEmoji = catchGamePetFoodMap[selectedEmoji] || "🍬";
}

function startCatchGame() {
  document.querySelector('.miniGameHeader').style.display = 'none';
  
  // Calculate canvas size based on viewport
  const viewportHeight = window.innerHeight;
  const canvasHeight = Math.min(400, viewportHeight * 0.7);
  
  setMiniGameContent(`
    <div id="catchGameScreen" style="position: relative; width: 100%; text-align: center; overflow: hidden;">
      <h3 id="catchGameCountdown">GET READY!!</h3>
      <canvas id="catchGameCanvas" width="400" height="${canvasHeight}" style="background: #222;"></canvas>
      <div id="catchGameMessage" 
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        font-size: 24px; color: white; background-color: rgba(0, 0, 0, 0.8); 
        padding: 20px; border-radius: 10px; display: none; z-index: 1000;">
      </div>
    </div>
  `);

  // Improved movement handling
  const canvas = document.getElementById('catchGameCanvas');
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    catchGamePlayerX = (e.clientX - rect.left) * scaleX;
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    catchGamePlayerX = (touch.clientX - rect.left) * scaleX;
  }, { passive: false });

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

  catchGameCanvas.onmousedown = null;
  catchGameCanvas.ontouchstart = null;
  catchGameCanvas.ontouchmove = null;

  catchGameCanvas.onmousedown = (e) => {
    const rect = catchGameCanvas.getBoundingClientRect();
    catchGamePlayerX = Math.max(15, Math.min(e.clientX - rect.left, catchGameCanvas.width - 15));
  };

  // Mobile: drag to move 
catchGameCanvas.ontouchmove = (e) => {
  e.preventDefault();
  const rect = catchGameCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  catchGamePlayerX = Math.max(15, Math.min(touch.clientX - rect.left, catchGameCanvas.width - 15));
};


  catchGameCaught = 0;
  catchGameItems = [];
  catchGamePlayerX = catchGameCanvas.width / 2;
  catchGameIsActive = true;

  if (catchGameLevel === 1) catchGameRequired = 10;
  else if (catchGameLevel === 2) catchGameRequired = 15;
  else if (catchGameLevel === 3) catchGameRequired = 20;
  else if (catchGameLevel === 4) catchGameRequired = 25;
  else catchGameRequired = 40;

  catchGameDropSpeed = 2 + (catchGameLevel - 1) * 0.5;

  if (catchGameDropInterval) {
    clearInterval(catchGameDropInterval);
  }

  startCatchDropInterval();
  requestAnimationFrame(runCatchGameLoop);
}

function startCatchDropInterval() {
  if (catchGameDropInterval) {
    clearInterval(catchGameDropInterval);
  }

  const intervalTime = Math.max(800 - (catchGameLevel - 1) * 100, 400);

  catchGameDropInterval = setInterval(() => {
    if (!catchGameIsActive) return;

    const isGood = Math.random() < 0.6;

    let emoji;
    if (isGood) {
      emoji = catchGameFoodEmoji;
    } else {
      emoji = catchGameBadEmojis[Math.floor(Math.random() * catchGameBadEmojis.length)];
    }

    catchGameItems.push({
      emoji: emoji,
      x: Math.random() * (catchGameCanvas.width - 30) + 15,
      y: -30
    });
  }, intervalTime);
}

function runCatchGameLoop(){
  if(!catchGameIsActive) return;

  catchGameCtx.clearRect(0, 0, catchGameCanvas.width, catchGameCanvas.height);

  catchGameCtx.fillStyle = "#fff";
  catchGameCtx.font = "16px Arial";
  catchGameCtx.fillText(`Level: ${catchGameLevel}`, 10, 20);
  catchGameCtx.fillText(`Caught: ${catchGameCaught}/${catchGameRequired}`, 10, 40);

  for (let i = 0; i < catchGameItems.length; i++) {
    let item = catchGameItems[i];
    item.y += catchGameDropSpeed;

    catchGameCtx.font = "24px serif";
    catchGameCtx.fillText(item.emoji, item.x, item.y);

    // Collision detection
    if (
      item.y > catchGameCanvas.height - 40 &&
      Math.abs(item.x - catchGamePlayerX) < 25
    ) {
      if (item.emoji === catchGameFoodEmoji) {
        catchGameCaught++;
      } else {
        // Bad item caught, end game
        endCatchGame(false);
        return;
      }
      // Remove caught item
      catchGameItems.splice(i, 1);
      i--;
    }
  }

  // Remove items that have fallen off the screen
  catchGameItems = catchGameItems.filter(item => item.y < catchGameCanvas.height + 30);

  // Draw player (pet)
  catchGameCtx.font = "36px serif";
  catchGameCtx.fillText(selectedEmoji || "🐶", catchGamePlayerX - 18, catchGameCanvas.height - 10);

  // Check win condition
  if (catchGameCaught >= catchGameRequired) {
    endCatchGame(true);
    return;
  }
  requestAnimationFrame(runCatchGameLoop);
}; 
function endCatchGame(success) {
  catchGameIsActive = false;
  clearInterval(catchGameDropInterval);

  const messageEl = document.getElementById("catchGameMessage");
  if (!messageEl) return;

  messageEl.style.display = "block";
  messageEl.innerHTML = `
    <p style="margin-bottom: 15px;">${success ? `🎉 Level ${catchGameLevel} Completed!` : `💥 You caught a bad emoji! Try Again!`}</p>
    <div style="margin-top: 10px;">
      <button onclick="startCatchGame()" style="margin: 0 5px; padding: 5px 15px;">
        🔁 ${success ? "Next Level" : "Try Again"}
      </button>
      <button onclick="exitMiniGame()" style="margin: 0 5px; padding: 5px 15px;">
        🔙 Back
      </button>
    </div>
  `;

  if (success) {
    catchGameLevel++;
  }
};
/* -------------------- GAME CONSTANTS & AUDIO -------------------- */
/*const SOUNDS = {
  jump: new Audio('data:audio/wav;base64,UklGRjIGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4GAAD//...'),
  collect: new Audio('data:audio/wav;base64,UklGRjIGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4GAAD//...'),
  levelUp: new Audio('data:audio/wav;base64,UklGRjIGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4GAAD//...'),
  fail: new Audio('data:audio/wav;base64,UklGRjIGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4GAAD//...').
};*/

const GAME_CONSTANTS = {
  PET_SIZE: 48,
  GROUND_HEIGHT: 20,
  GRAVITY: 0.22,
  JUMP_FORCE: -8,
  COLLISION_BUFFER: 5
};

// Error handling and utilities
const GameError = {
  showError: (message) => {
    console.error(`[Game Error]: ${message}`);
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'game-error';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  },
  
  validate: {
    number: (value, min, max, defaultVal) => {
      const num = Number(value);
      if (isNaN(num) || num < min || num > max) {
        GameError.showError(`Invalid value: ${value}. Using default: ${defaultVal}`);
        return defaultVal;
      }
      return num;
    },
    
    state: () => {
      if (!selectedEmoji || !document.getElementById('petDisplay')) {
        GameError.showError("Game state is invalid. Resetting...");
        resetGame(true);
        return false;
      }
      return true;
    }
  }
};

// Add this CSS for error messages
const errorStyle = `
  .game-error {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    animation: fadeInOut 3s ease-in-out;
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
  }
`;

// Add style to document
const styleSheet = document.createElement("style");
styleSheet.textContent = errorStyle;
document.head.appendChild(styleSheet);

// Enhanced state management
const GameState = {
  _state: {
    selectedEmoji: "",
    xp: 0,
    level: 1,
    hunger: 50,
    happiness: 50,
    energy: 50,
    hasRunAway: false,
    catchGameLevel: 1,
    jumpGameLevel: 1
  },

  get: (key) => GameState._state[key],
  
  set: (key, value) => {
    GameState._state[key] = value;
    GameState.save();
    return value;
  },

  save: () => {
    try {
      localStorage.setItem('virtualPetGame', JSON.stringify(GameState._state));
    } catch (e) {
      GameError.showError("Failed to save game state");
    }
  },

  load: () => {
    try {
      const saved = localStorage.getItem('virtualPetGame');
      if (saved) {
        GameState._state = JSON.parse(saved);
        return true;
      }
    } catch (e) {
      GameError.showError("Failed to load game state");
    }
    return false;
  },

  reset: () => {
    GameState._state = {
      selectedEmoji: "",
      xp: 0,
      level: 1,
      hunger: 50,
      happiness: 50,
      energy: 50,
      hasRunAway: false,
      catchGameLevel: 1,
      jumpGameLevel: 1
    };
    GameState.save();
  }
};

// Enhanced mini-game management
const MiniGames = {
  isActive: false,
  currentGame: null,
  
  start: (gameName) => {
    if (!GameState.validate.state()) return;
    
    MiniGames.isActive = true;
    MiniGames.currentGame = gameName;
    
    switch(gameName) {
      case 'jump':
        startJumpGame();
        break;
      case 'catch':
        startCatchGame();
        break;
      default:
        GameError.showError("Invalid game selected");
    }
  },
  
  end: (success) => {
    if (!MiniGames.isActive) return;
    
    MiniGames.isActive = false;
    const game = MiniGames.currentGame;
    MiniGames.currentGame = null;
    
    try {
      if (success) {
        if (game === 'jump') GameState.set('jumpGameLevel', GameState.get('jumpGameLevel') + 1);
        if (game === 'catch') GameState.set('catchGameLevel', GameState.get('catchGameLevel') + 1);
        
        GameState.set('xp', GameState.get('xp') + 10);
        GameState.set('happiness', Math.min(GameState.get('happiness') + 30, 100));
      }
      
      GameState.set('energy', Math.max(GameState.get('energy') - 10, 0));
      updateStatus();
      checkLevelUp();
      
    } catch (e) {
      GameError.showError("Error ending mini-game");
      console.error(e);
    }
  }
};

// Enhanced input handling
const InputHandler = {
  touchStartX: 0,
  touchStartY: 0,
  
  init: () => {
    document.addEventListener('touchstart', InputHandler.handleTouchStart, false);
    document.addEventListener('touchmove', InputHandler.handleTouchMove, false);
    document.addEventListener('keydown', InputHandler.handleKeyDown, false);
  },
  
  cleanup: () => {
    document.removeEventListener('touchstart', InputHandler.handleTouchStart);
    document.removeEventListener('touchmove', InputHandler.handleTouchMove);
    document.removeEventListener('keydown', InputHandler.handleKeyDown);
  },
  
  handleTouchStart: (evt) => {
    InputHandler.touchStartX = evt.touches[0].clientX;
    InputHandler.touchStartY = evt.touches[0].clientY;
  },
  
  handleTouchMove: (evt) => {
    if (!evt.touches[0] || !MiniGames.isActive) return;
    
    const xDiff = evt.touches[0].clientX - InputHandler.touchStartX;
    const yDiff = evt.touches[0].clientY - InputHandler.touchStartY;
    
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (MiniGames.currentGame === 'catch') {
        evt.preventDefault();
        handleCatchGameMove(evt.touches[0].clientX);
      }
    }
  },
  
  handleKeyDown: (evt) => {
    if (!MiniGames.isActive) return;
    
    switch(evt.code) {
      case 'Space':
        if (MiniGames.currentGame === 'jump') handleJumpGameKey(evt);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (MiniGames.currentGame === 'catch') {
          evt.preventDefault();
          handleCatchGameKey(evt);
        }
        break;
    }
  }
};

// Initialize game with error handling
window.addEventListener('DOMContentLoaded', () => {
  try {
    InputHandler.init();
    if (GameState.load()) {
      updateStatus();
    }
  } catch (e) {
    GameError.showError("Failed to initialize game");
    console.error(e);
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  InputHandler.cleanup();
  GameState.save();
});

window.addEventListener('DOMContentLoaded', () => {
  const savedState = localStorage.getItem('virtualPetGame');
  if (savedState) {
    const state = JSON.parse(savedState);
    selectedEmoji = state.selectedEmoji;
    xp = state.xp;
    level = state.level;
    hunger = state.hunger;
    happiness = state.happiness;
    energy = state.energy;
    
    if (selectedEmoji) {
      document.getElementById("petSelectScreen").style.display = "block";
      document.getElementById("mainPlane").style.display = "none";
      document.getElementById("petDisplay").textContent = selectedEmoji;
      updateStatus();
    } else {
      document.getElementById("petSelectScreen").style.display = "block";
      document.getElementById("mainPlane").style.display = "none";
    }
  } else {
    document.getElementById("petSelectScreen").style.display = "block";
    document.getElementById("mainPlane").style.display = "none";
  }
});
