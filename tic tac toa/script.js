'use strict';

// ── State ──────────────────────────────────────────────
const state = {
  board: Array(9).fill(''),
  currentPlayer: 'X',
  scores: { X: 0, O: 0 },
  gameOver: false,
};

const WIN_PATTERNS = [
  [0,1,2], [3,4,5], [6,7,8],   // rows
  [0,3,6], [1,4,7], [2,5,8],   // cols
  [0,4,8], [2,4,6],             // diagonals
];

// ── DOM refs ───────────────────────────────────────────
const boardEl    = document.getElementById('board');
const statusEl   = document.getElementById('status');
const turnBarEl  = document.getElementById('turnBar');
const turnTextEl = document.getElementById('turnText');
const scoreX     = document.getElementById('scoreX');
const scoreO     = document.getElementById('scoreO');
const scorePanelX = document.querySelector('.score-box:first-child');
const scorePanelO = document.querySelector('.score-box:last-child');

// ── Build board ────────────────────────────────────────
function buildBoard() {
  boardEl.innerHTML = '';
  boardEl.classList.remove('disabled');

  state.board.forEach((_, i) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  });
}

// ── Cell click ─────────────────────────────────────────
function onCellClick(e) {
  const idx = +e.currentTarget.dataset.index;
  if (state.gameOver || state.board[idx]) return;

  placeMarker(idx);
}

function placeMarker(idx) {
  const player = state.currentPlayer;
  state.board[idx] = player;

  const cell = boardEl.children[idx];
  cell.textContent = player;
  cell.classList.add(player === 'X' ? 'x-mark' : 'o-mark', 'place-anim');
  cell.dataset.taken = '1';

  // Remove animation class after it runs so it can replay if needed
  cell.addEventListener('animationend', () => cell.classList.remove('place-anim'), { once: true });

  const winLine = getWinLine();
  if (winLine) {
    endGame(player, winLine);
    return;
  }

  if (!state.board.includes('')) {
    endGame(null);
    return;
  }

  switchPlayer();
}

// ── Win detection ──────────────────────────────────────
function getWinLine() {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (
      state.board[a] &&
      state.board[a] === state.board[b] &&
      state.board[a] === state.board[c]
    ) {
      return pattern;
    }
  }
  return null;
}

// ── End game ───────────────────────────────────────────
function endGame(winner, winLine = []) {
  state.gameOver = true;
  boardEl.classList.add('disabled');

  if (winner) {
    state.scores[winner]++;
    updateScoreboard();

    winLine.forEach(i => boardEl.children[i].classList.add('winner'));

    setStatus(`PLAYER ${winner} WINS`, winner === 'X' ? 'win-x' : 'win-o');
    setTurnBar(`PLAYER ${winner} WINS`, winner);
  } else {
    setStatus('DRAW — WELL PLAYED', 'draw');
    setTurnBar('NO WINNER', null);
  }
}

// ── Switch player ──────────────────────────────────────
function switchPlayer() {
  state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
  setTurnBar(`PLAYER ${state.currentPlayer}'S TURN`, state.currentPlayer);
}

// ── UI helpers ─────────────────────────────────────────
function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (cls ? ' ' + cls : '');
}

function setTurnBar(msg, player) {
  turnTextEl.textContent = msg;
  turnBarEl.className = 'turn-bar' + (player ? ` turn-${player.toLowerCase()}` : '');
}

function updateScoreboard() {
  scoreX.textContent = state.scores.X;
  scoreO.textContent = state.scores.O;
}

function highlightActivePlayer() {
  scorePanelX.classList.toggle('active-x', state.currentPlayer === 'X' && !state.gameOver);
  scorePanelO.classList.toggle('active-o', state.currentPlayer === 'O' && !state.gameOver);
}

// ── Restart round ──────────────────────────────────────
function restartRound() {
  state.board.fill('');
  state.currentPlayer = 'X';
  state.gameOver = false;

  buildBoard();
  setStatus('');
  setTurnBar("PLAYER X'S TURN", 'X');
}

// ── Reset all scores ───────────────────────────────────
function resetAll() {
  state.scores.X = 0;
  state.scores.O = 0;
  updateScoreboard();
  restartRound();
}

// ── Observe turn changes to sync score highlight ───────
const turnObserver = new MutationObserver(() => highlightActivePlayer());
turnObserver.observe(turnBarEl, { attributes: true, attributeFilter: ['class'] });

// ── Init ───────────────────────────────────────────────
buildBoard();
setTurnBar("PLAYER X'S TURN", 'X');

