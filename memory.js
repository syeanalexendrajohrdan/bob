// Memory Match mini-game integrated into miniGameContent
// Usage: call startMemoryGame() from mini-game menu

function startMemoryGame() {
  if (!selectedEmoji) {
    // allow play without pet? keep consistent with other mini-games: require pet
    GameError.showError('Please select a pet first!');
    return;
  }

  // Inject minimal styles once
  if (!document.getElementById('memory-styles')) {
    const css = `
      #memoryRoot { padding: 10px; width: 100%; }
      #memoryStats { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px; }
      #memoryBoard { width: 100%; max-width:600px; margin: 0 auto; display:grid; grid-template-columns: repeat(6, 1fr); gap: 10px; perspective:1000px; }
      .memory-card { position: relative; width:100%; padding-top:100%; transform-style:preserve-3d; transition: transform 0.45s; cursor:pointer; }
      .memory-card.flip { transform: rotateX(180deg); }
      .memory-card .face { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; backface-visibility:hidden; border-radius:8px; font-size:2rem; }
      .memory-card .front { background: white; transform: rotateX(180deg); }
      .memory-card .back { background: linear-gradient(135deg,#2a2a3a,#1a1a2a); color:white; }
      #memoryRoot .controls button { padding:8px 14px; border-radius:10px; border:none; cursor:pointer; }
      @media (max-width:480px){ #memoryBoard { grid-template-columns: repeat(4, 1fr); } }
    `;
    const s = document.createElement('style'); s.id = 'memory-styles'; s.textContent = css; document.head.appendChild(s);
  }

  setMiniGameContent(`
    <div id="memoryRoot">
      <div id="memoryStats">
        <div>Moves: <span id="memory-moves">0</span></div>
        <div class="controls">
          <button id="memory-restart">🔄 Restart</button>
          <button id="memory-back">⬅️ Back</button>
        </div>
      </div>
      <section id="memoryBoard"></section>
    </div>
  `);

  // Scoped game state
  const emojis = ["🐶","🦴","🐱","🐟","🐰","🥕","🐻","🍯","🦁","🥩","🐭","🧀","💣","💀","💩"];
  const boardEl = document.getElementById('memoryBoard');
  const movesEl = document.getElementById('memory-moves');
  const restartBtn = document.getElementById('memory-restart');
  const backBtn = document.getElementById('memory-back');

  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard = null, secondCard = null;
  let matchedPairs = 0;
  let moves = 0;

  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  function createBoard() {
    const cards = shuffle([...emojis, ...emojis]);
    boardEl.innerHTML = '';
    cards.forEach((cardEmoji, idx) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.emoji = cardEmoji;
      card.dataset.index = idx;

      const front = document.createElement('div'); front.className = 'face front'; front.textContent = cardEmoji;
      const back = document.createElement('div'); back.className = 'face back'; back.textContent = '';

      card.appendChild(front);
      card.appendChild(back);

      card.addEventListener('click', onCardClick);
      boardEl.appendChild(card);
    });
  }

  function onCardClick(e) {
    const card = e.currentTarget;
    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains('match')) return;

    card.classList.add('flip');

    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    moves++; movesEl.textContent = moves;
    checkForMatch();
  }

  function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    if (isMatch) {
      firstCard.classList.add('match');
      secondCard.classList.add('match');
      firstCard.removeEventListener('click', onCardClick);
      secondCard.removeEventListener('click', onCardClick);
      matchedPairs++;
      resetTurn();
      if (matchedPairs === emojis.length) {
        setTimeout(() => {
          document.getElementById('miniGameMessage').textContent = `🎉 You won! Moves: ${moves}`;
        }, 300);
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetTurn();
      }, 800);
    }
  }

  function resetTurn() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  function restartGame() {
    matchedPairs = 0; moves = 0; movesEl.textContent = moves; resetTurn(); createBoard();
  }

  // Wire buttons
  restartBtn.addEventListener('click', restartGame);
  backBtn.addEventListener('click', () => { document.getElementById('miniGameMessage').textContent = ''; exitMiniGame(); });

  // Start
  createBoard();
}
