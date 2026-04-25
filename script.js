
// ===== DOM ELEMENTS =====
const board = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const bestScoreEl = document.getElementById("bestScore");
const goalEl = document.getElementById("goal");

// ===== SOUNDS =====
const flipSound = new Audio("sounds/flip.mp3");
const matchSound = new Audio("sounds/match.mp3");
const winSound = new Audio("sounds/win.mp3");

// ===== GAME STATE =====
let level = 1;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

let images = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let isPaused = false;

let moves = 0;
let matchedPairs = 0;

let totalPairs = 4;

let timer = 0;
let interval = null;
let started = false;

let score = 0;
let goalTime = 60;

// ===== SHUFFLE =====
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ===== LOAD IMAGES =====
function loadImages() {
  images = [];

  for (let i = 1; i <= totalPairs; i++) {
    images.push(`images/img${i}.jpg`);
  }

  images = [...images, ...images];
  shuffle(images);
}

// ===== BUILD BOARD =====
function buildBoard() {
  board.innerHTML = "";

  images.forEach(img => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = img;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${img}">
        </div>
        <div class="card-back">💖</div>
      </div>
    `;

    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

// ===== PAUSE =====
function togglePause() {
  isPaused = !isPaused;

  if (isPaused) {
    clearInterval(interval);
  } else {
    startTimer();
  }
}

// ===== FLIP CARD =====
function flipCard(card) {
  if (isPaused) return;
  if (lockBoard || card === firstCard || card.classList.contains("matched")) return;

  if (!started) {
    startTimer();
    started = true;
  }

  card.classList.add("flipped");
  playSound(flipSound);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;

  moves++;
  checkMatch();
  updateGame();
}

// ===== CHECK MATCH =====
function checkMatch() {
  if (firstCard.dataset.image === secondCard.dataset.image) {

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    playSound(matchSound);

    matchedPairs++;

    resetTurn();

    if (matchedPairs === totalPairs) {
      clearInterval(interval);
      updateScore();
      saveGame();

      setTimeout(() => {
        playSound(winSound);
        alert(`You won 💖\nScore: ${score}\nTime: ${timer}s\nMoves: ${moves}`);
      }, 300);
    }

  } else {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800);
  }
}

// ===== RESET TURN =====
function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// ===== TIMER =====
function startTimer() {
  clearInterval(interval);

  interval = setInterval(() => {
    if (!isPaused) {
      timer++;
      updateGame();
    }
  }, 1000);
}

// ===== SCORE =====
function updateScore() {
  let timePenalty = timer;
  let movePenalty = moves * 2;

  score = Math.max(1000 - (timePenalty + movePenalty * 5), 0);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
}

// ===== SAVE GAME =====
function saveGame() {
  localStorage.setItem("score", score);
  localStorage.setItem("time", timer);
  localStorage.setItem("moves", moves);
}

// ===== CONTINUE GAME =====
function continueGame() {
  let savedScore = localStorage.getItem("score");
  let savedTime = localStorage.getItem("time");
  let savedMoves = localStorage.getItem("moves");

  if (savedScore !== null) {
    score = Number(savedScore);
    timer = Number(savedTime);
    moves = Number(savedMoves);

    updateGame();
  }
}

// ===== DIFFICULTY =====
function setDifficulty(selected) {
  if (selected === "easy") {
    totalPairs = 4;
    level = 1;
    goalTime = 60;
  }

  if (selected === "medium") {
    totalPairs = 8;
    level = 2;
    goalTime = 90;
  }

  if (selected === "hard") {
    totalPairs = 12;
    level = 3;
    goalTime = 120;
  }

  restartGame();
}

// ===== UI UPDATE (ONLY SOURCE OF TRUTH) =====
function updateGame() {
  movesEl.textContent = moves;
  timerEl.textContent = timer;
  scoreEl.textContent = score;

  levelEl.textContent = level;
  bestScoreEl.textContent = bestScore;
  goalEl.textContent = goalTime + "s";
}

// ===== RESTART =====
function restartGame() {
  clearInterval(interval);

  firstCard = null;
  secondCard = null;
  lockBoard = false;

  moves = 0;
  timer = 0;
  matchedPairs = 0;
  score = 0;
  started = false;

  loadImages();
  buildBoard();
  updateGame();
}

// ===== NEW GAME =====
function newGame() {
  restartGame();
}

// ===== SOUND =====
function playSound(sound) {
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(err => {
    console.log("Sound blocked or missing:", err);
  });
}

// ===== START =====
restartGame();