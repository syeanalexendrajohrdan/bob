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

