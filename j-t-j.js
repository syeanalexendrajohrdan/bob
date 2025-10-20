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

  // After 2 seconds, return to main screen
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
