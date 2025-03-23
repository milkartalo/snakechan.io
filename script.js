const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const replayButton = document.getElementById('replayButton');
const gameOverMessage = document.getElementById('gameOverMessage'); // Get the game over message element
const replayingMessage = document.getElementById('replayingMessage'); // Get the replaying message element

let snake, direction, food, bigFood, score, highScore, gameInterval, bigFoodInterval;
let bigFoodVisible = false;
let bigFoodColor = 'gold'; // Initial color for big food
let colorChangeInterval;
let bigFoodTimer;
let remainingTime = 6; // 6 seconds for the big food timer
let timerInterval;

// Initial speed of the snake (milliseconds)
let snakeSpeed = 150; // Slightly reduced speed
let speedIncreaseInterval; // Interval for increasing speed after eating big food

// Array of colors for the snake's body segments
const colors = ['green', 'lightgreen', 'yellow', 'orange', 'red', 'purple', 'blue', 'cyan'];

function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = generateFood();
    score = 0;
    bigFoodVisible = false;
    updateScoreDisplay();
    replayButton.style.display = 'none';
    gameOverMessage.style.display = 'none'; // Hide game over message
    replayingMessage.style.display = 'none'; // Hide replaying message
    gameInterval = setInterval(draw, snakeSpeed);
    bigFoodInterval = setInterval(showBigFood, 30000); // Show big food every 30 seconds
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / 20)),
        y: Math.floor(Math.random() * (canvas.height / 20))
    };
}

function showBigFood() {
    if (score >= 4 && !bigFoodVisible) {
        bigFood = generateFood();
        bigFoodVisible = true;
        remainingTime = 6; // Reset the timer
        startColorChange(); // Start changing the color of the big food
        startBigFoodTimer(); // Start the 6-second timer for big food
    }
}

function startColorChange() {
    // Change color every 500 milliseconds
    colorChangeInterval = setInterval(() => {
        bigFoodColor = getRandomColor();
    }, 500);
}

function startBigFoodTimer() {
    // Set a timer to hide the big food after 6 seconds
    timerInterval = setInterval(() => {
        remainingTime--;
        if (remainingTime <= 0) {
            bigFoodVisible = false; // Hide big food after 6 seconds
            clearInterval(colorChangeInterval); // Stop color changing when it disappears
            clearInterval(timerInterval); // Stop the timer
        }
    }, 1000);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333'; // Set background color to dark
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = colors[i % colors.length]; // Cycle through colors
        ctx.fillRect(snake[i].x * 20, snake[i].y * 20, 18, 18);
        ctx.strokeRect(snake[i].x * 20, snake[i].y * 20, 18, 18);
    }

    // Draw regular food as a smaller round shape
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x * 20 + 9, food.y * 20 + 9, 9, 0, Math.PI * 2); // Draw a smaller circle
    ctx.fill(); // Fill the circle
    ctx.stroke(); // Optional: stroke the circle

    // Draw big food if it is visible
    if (bigFoodVisible) {
        ctx.fillStyle = bigFoodColor; // Use the changing color for big food
        ctx.beginPath();
        ctx.arc(bigFood.x * 20 + 18, bigFood.y * 20 + 18, 18, 0, Math.PI * 2); // Draw a larger circle
        ctx.fill(); // Fill the circle
        ctx.stroke(); // Optional: stroke the circle

        // Display the timer in the center of the canvas
        ctx.fillStyle = 'white'; // Set text color to white
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Time: ${remainingTime}`, canvas.width / 2, canvas.height / 2);
    }

    // Move snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = generateFood();
    } else if (bigFoodVisible && isTouchingBigFood(head, bigFood)) {
        score += 5; // Increase score by 5 for big food
        bigFoodVisible = false; // Hide big food after eating
        clearTimeout(bigFoodTimer); // Clear the timer if big food is eaten
        clearInterval(colorChangeInterval); // Stop color changing when eaten
        clearInterval(timerInterval); // Stop the timer

        // Start increasing speed every 10 seconds
        startSpeedIncrease();
    } else {
        // Remove the last segment to create the follow-the-leader effect
        snake.pop();
    }

    // Check for wall collision or self-collision
    if (head.x <  0 || head.x >= canvas.width / 20 || head.y < 0 || head.y >= canvas.height / 20 || collision(head)) {
        clearInterval(gameInterval);
        clearInterval(bigFoodInterval); // Stop the big food interval
        clearInterval(timerInterval); // Stop the big food timer
        clearInterval(colorChangeInterval); // Stop color changing interval
        clearInterval(speedIncreaseInterval); // Stop speed increase interval
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        updateHighScoreDisplay();
        gameOverMessage.style.display = 'block'; // Show game over message
        replayButton.style.display = 'block'; // Show replay button
    }

    updateScoreDisplay();
}

function isTouchingBigFood(head, bigFood) {
    const distance = Math.sqrt(Math.pow(head.x * 20 - (bigFood.x * 20 + 18), 2) + Math.pow(head.y * 20 - (bigFood.y * 20 + 18), 2));
    return distance < 30; // Adjust the threshold as needed
}

function collision(head) {
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

function updateHighScoreDisplay() {
    highScoreDisplay.textContent = highScore;
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});

replayButton.addEventListener('click', () => {
    initGame();
    gameOverMessage.style.display = 'none'; // Hide game over message
    replayingMessage.style.display = 'block'; // Show replaying message
    setTimeout(() => {
        replayingMessage.style.display = 'none'; // Hide replaying message after 5 seconds
    }, 5000);
});

// Load high score from local storage
highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
updateHighScoreDisplay();
initGame();

// Speed increase logic
function startSpeedIncrease() {
    // Clear any existing speed increase interval
    clearInterval(speedIncreaseInterval);

    // Increase speed every 10 seconds
    speedIncreaseInterval = setInterval(() => {
        snakeSpeed = Math.max(50, snakeSpeed - 10); // Decrease interval to increase speed, minimum 50ms
        clearInterval(gameInterval); // Clear the existing game interval
        gameInterval = setInterval(draw, snakeSpeed); // Restart the game interval with new speed
    }, 10000); // Increase speed every 10 seconds
}