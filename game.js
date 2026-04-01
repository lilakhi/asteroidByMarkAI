// Game state and configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d')
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game Variables

let gameState = 'playing'; //'playing', 'gameOver' [[isAlive ??]]
let score = 0;
let lives = 3;
let keys = {};

// Game objects
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    velX: 0,
    velY: 0,
    size: 15
};

let bullets = [];
let asteroids = [];
let particles = [];

// Game settings
const PLAYER_SPEED = 0.3;
const PLAYER_FRICTION = 0.98;
const BULLET_SPEED = 8;
const ASTEROID_SPEED = 2;

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function updatePlayer() {
    // Rotation
    if (keys['a'] || keys['arrowLeft']) {
        player.angle -= 0.1;
    }
    if (keys ['d'] || keys['arrowright']) {
        player.angle += 0.1;
    }

    // Thrust
    if (keys['w'] || keys['arrowup']) {
        player.velX += Math.cos(player.angle) * PLAYER_SPEED;
        player.velY += Math.sin(player.angle) * PLAYER_SPEED;
    }

    // Apply friction and update position
    player.velX *= PLAYER_FRICTION;
    player.velY *= PLAYER_FRICTION;

    player.x += player.velX;
    player.y += player.velY;

    // Screen wrapping
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0
    if (player.y < 0) player.y = canvas.height
    if (player.y > canvas.height) player.y = 0

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Draw ship
    ctx.beginPath();
    ctx.moveTo(player.size, 0);
    ctx.lineTo(-player.size, -player.size / 2);
    ctx.lineTo(-player.size / 2, 0);
    ctx.lineTo(-player.size, player.size / 2);
    ctx.closePath();

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw thrust
    if (keys['w'] || keys['arrowup']) {
        ctx.beginPath();
        ctx.moveTo(-player.size, 0);
        ctx.lineTo(-player.size * 1.5, 0);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    ctx.restore();
}

}