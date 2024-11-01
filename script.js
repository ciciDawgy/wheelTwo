// Canvas setup for the wheel
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const segments = ['100', '200', '300', '400', '500', '600', '700', 'Bankrupt', 'Lose a Turn'];
const colors = ['#f39c12', '#e74c3c', '#8e44ad', '#2980b9', '#27ae60', '#16a085', '#c0392b', '#d35400', '#2ecc71'];
let angle = 0;
let isSpinning = false;

// Game setup
const players = [
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 }
];
let currentPlayerIndex = 0;
const puzzleWord = 'JAVASCRIPT';
let revealedLetters = Array(puzzleWord.length).fill('_');

// Display player info
const playerInfoDiv = document.getElementById('playerInfo');
const puzzleBoardDiv = document.getElementById('puzzleBoard');

// Draw the Wheel of Fortune
function drawWheel() {
    const arcSize = (2 * Math.PI) / segments.length;
    for (let i = 0; i < segments.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, arcSize * i, arcSize * (i + 1));
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(segments[i], canvas.width / 2 + Math.cos(arcSize * i + arcSize / 2) * 120, canvas.height / 2 + Math.sin(arcSize * i + arcSize / 2) * 120);
    }
}

// Spin the wheel and determine the result
function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    let spinAngle = Math.floor(Math.random() * 360) + 720; // Random spin of at least two full turns

    const spinInterval = setInterval(() => {
        angle += 5; // Adjust this value for different spin speeds
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();
    }, 10);

    setTimeout(() => {
        clearInterval(spinInterval);
        isSpinning = false;
        const segmentIndex = Math.floor(((angle % 360) / 360) * segments.length);
        handleSpinResult(segments[segmentIndex]);
    }, spinAngle);
}

// Handle the result of the wheel spin
function handleSpinResult(result) {
    if (result === 'Bankrupt') {
        players[currentPlayerIndex].score = 0;
        updatePlayerInfo(`Bankrupt! ${players[currentPlayerIndex].name} loses all points!`);
        switchPlayer();
    } else if (result === 'Lose a Turn') {
        updatePlayerInfo(`${players[currentPlayerIndex].name} loses a turn!`);
        switchPlayer();
    } else {
        updatePlayerInfo(`${players[currentPlayerIndex].name} landed on $${result}. Guess a letter!`);
    }
}

// Display the puzzle board
function displayPuzzleBoard() {
    puzzleBoardDiv.innerHTML = '';
    revealedLetters.forEach(letter => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'puzzle-letter';
        letterDiv.textContent = letter;
        puzzleBoardDiv.appendChild(letterDiv);
    });
}

// Handle player's letter guess
function makeGuess() {
    const guessInput = document.getElementById('guessInput');
    const guess = guessInput.value.toUpperCase();
    guessInput.value = '';

    if (!guess || guess.length !== 1 || !/^[A-Z]$/.test(guess)) {
        updatePlayerInfo('Please enter a valid letter.');
        return;
    }

    if (puzzleWord.includes(guess)) {
        updateRevealedLetters(guess);
    } else {
        updatePlayerInfo(`Incorrect guess! ${players[currentPlayerIndex].name} loses a turn.`);
        switchPlayer();
    }
}

// Update revealed letters on the puzzle board
function updateRevealedLetters(letter) {
    let correctGuess = false;
    for (let i = 0; i < puzzleWord.length; i++) {
        if (puzzleWord[i] === letter) {
            revealedLetters[i] = letter;
            correctGuess = true;
        }
    }
    displayPuzzleBoard();
    if (revealedLetters.join('') === puzzleWord) {
        updatePlayerInfo(`${players[currentPlayerIndex].name} wins! The word was: ${puzzleWord}`);
    } else if (correctGuess) {
        updatePlayerInfo(`Good guess! ${players[currentPlayerIndex].name}, you get another turn!`);
    }
}

// Update player information and scores
function updatePlayerInfo(message) {
    playerInfoDiv.innerHTML = `<p>${message}</p><p>${players[0].name}: $${players[0].score} | ${players[1].name}: $${players[1].score}</p>`;
}

// Switch to the next player
function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayerInfo(`It's now ${players[currentPlayerIndex].name}'s turn. Spin the wheel!`);
}

// Initialize the game setup
drawWheel();
displayPuzzleBoard();
updatePlayerInfo(`Welcome to Wheel of Fortune! It's ${players[currentPlayerIndex].name}'s turn. Click on the wheel to spin.`);

// Add event listener for the wheel spin
canvas.addEventListener('click', spinWheel);
