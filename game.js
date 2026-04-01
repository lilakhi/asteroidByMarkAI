// Game state and configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
}

// Draw Ship

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


// Shooting
let lastShotTime = 0;
const SHOT_COOLDOWN = 100; //milliseconds

function handleShooting() {
    if ((keys[' '] || keys['spacebar']) && Date.now() - lastShotTime > SHOT_COOLDOWN) {
        bullets.push({
            x: player.x + Math.cos(player.angle) * player.size,
            y: player.y + Math.sin(player.angle) * player.size,
            velX: Math.cos(player.angle) * BULLET_SPEED,
            velY: Math.sin(player.angle) * BULLET_SPEED,
            life: 60 // bullets disappear after 60 frames
        });
        lastShotTime = Date.now();
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];

        bullet.x += bullet.velX;
        bullet.y += bullet.velY;
        bullet.life--;

        // Screen wrapping
        if (bullet.x < 0) bullet.x = canvas.width;
        if (bullet.x > canvas.width) bullet.x = 0;
        if (bullet.y < 0) bullet.y = canvas.height;
        if (bullet.y > canvas.height) bullet.y = 0;

        // Remove old bullets
        if (bullet.life <= 0) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Generate Asteroids

function createAsteroid(x, y, size) {
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        velX: (Math.random() - 0.5) * ASTEROID_SPEED,
        velY: (Math.random() - 0.5) * ASTEROID_SPEED,
        size: size || Math.random() * 30 + 20,
        angle: 0,
        rotation: (Math.random() - 0.5) * 0.1,
        vertices: generateAsteroidVertices()
    };
}

function generateAsteroidVerticies() {
    let vertices = [];
    let numVertices = 8 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numVertices; i++) {
        let angle = (i / numVertices) * Math.PI * 2;
        let radius = 0.7 + Math.random() * 0.6; // Random radius variation
        vertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
         });
    }
    
    return vertices;
}

function updateAsteroids() {
    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.velX;
        asteroid.y += asteroid.velY;
        asteroid.angle += asteroid.rotation;

        //Screen wrapping
        if (asteroid.x < -asteroid.size) asteroid.x = canvas.width + asteroid.size;
        if (asteroid.x > canvas.width + asteroid.size) asteroid.x = -asteroid.size;
        if (asteroid.y < -asteroid.size) asteroid.y = canvas.height + asteroid.size;
        if (asteroid.y > canvas.height + asteroid.size) asteroid.y = -asteroid.size;
    });
}

function drawAsteroids() {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;

    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.angle);
        ctx.scale(asteroid.size, asteroid.size);

        ctx.beginPath();
        asteroid.vertices.forEach((vertex, i) => {
            if (i === 0) {
                ctx.moveTo(vertex.x, vertex.y);
            } else {
                ctx.lineTo(vertex.x, vertex.y);
            }
        });
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    });
}

//Initialize some asteroids
function initializeAsteroids() {
    for (let i = 0; i < 5; i++) {
        // Make sure asteroids don't spawn on player
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < 100);

        asteroids.push(createAsteroid(x, y));
    }
}


// Add collision detection

function checkCollisions() {
    // Bullet-asteroid collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            let bullet = bullets[i];
            let asteroid = asteroids[j];

            let distance = Math.sqrt(
                (bullet.x - asteroid.x) ** 2 +
                (bullet.y - asteroid.y) ** 2
            );

            if (distance < asteroid.size) {
                // Create explosion particles
                createExplosion(asteroid.x, asteroid.y, 8);

                // Update score
                score += Math.floor(asteroid.size);
                scoreElement.textContent = score;

                //Split large asteroids
                if (asteroid.size > 25) {
                    for (let k = 0; k < 2; k++) {
                        asteroids.push(createAsteroid(
                            asteroid.x,
                            asteroid.y,
                            asteroid.size *  0.6
                        ));
                    }
                }

                //Remove bullet and asteroid
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                break;
            }
        }
    }

    //Player-asteroid collision
    for (let i = asteroids.length - 1; i >= 0; i--) {
        let asteroid = asteroids[i];
        let distance = Math.sqrt(
            (player.x - asteroid.x) ** 2 +
            (player.y - asteroid.y) ** 2
        );

        if (distance < asteroid.size + player.size) {
            // Player hit
            lives--;
            livesElement.textContent = lives;

            // Create explosion
            createExplosion(player.x, player.y, 12);

            // Reset player position
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
            player.velX = 0;
            player.velY = 0;

            // Check game over
            if (lives <= 0) {
                gameState = 'gameOver';
                finalScoreElement.textContent = score;
                gameOverElement.style.display = 'block';
            }

            break;
        }
    }
}