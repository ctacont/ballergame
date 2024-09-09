const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const rabbitOverlay = document.getElementById('rabbitOverlay');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const gameContainer = document.getElementById('gameContainer');
const backgroundMusic = document.getElementById('backgroundMusic');
const volumeControl = document.getElementById('volumeControl');

canvas.width = 800;
canvas.height = 600;



let bullets = [];
// let enemies = [];
let particles = [];
let lives = 3;
let shakeTime = 0;
let shakeIntensity = 0;
let gameRunning = false;
let gameOverScreenActive = false;
let volume = 0.3;

backgroundMusic.volume = volume;
volumeControl.textContent = `Volume: ${Math.round(volume * 100)}%`;


const spaceshipImage = new Image();
spaceshipImage.src = 'img/spaceship.gif'; // Replace with your spaceship image URL

const spaceship = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 70,
    speed: 5
};
function drawSpaceship() {
    // ctx.fillStyle = '#fff';
    // ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
    //spaceshipImage.onload = function () {
    ctx.drawImage(spaceshipImage, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
    //};
}

function drawBullets() {
    for (let bullet of bullets) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    }
}

/* 
let enemies = [];
function drawEnemies() {
    for (let enemy of enemies) {
        ctx.fillStyle = '#f00';
        ctx.fillRect(enemy.x, enemy.y, 50, 50);
    }
}
    */


const breiteEnemy = 70;
const hoeheEnemy = 80;
const rahmenEnemy = "transparent"; // farbe kann angegeben werden z.B red, blue ....

// ----------------------------------------------------------------------

let enemies = [];
let enemyImage = new Image(); // Create a new image object
enemyImage.src = 'img/monster2.gif'; // Set the source of the image

// Warten, bis das Bild geladen ist
enemyImage.onload = function () {
    // Hier können Sie die drawEnemies()-Funktion aufrufen
    drawEnemies();
};

function drawEnemies() {
    for (let enemy of enemies) {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, breiteEnemy, hoeheEnemy); // Größe auf 100x100 geändert
        ctx.strokeStyle = `${rahmenEnemy}`; // Rahmenfarbe auf Rot setzen
        ctx.lineWidth = 2; // Rahmenbreite auf 2 Pixel setzen
        ctx.strokeRect(enemy.x, enemy.y, breiteEnemy, hoeheEnemy); // Rahmen zeichnen
    }
}

// ----------------------------------------------------------------------
function drawParticles() {
    for (let particle of particles) {
        ctx.fillStyle = `rgba(255, ${particle.g}, 0, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            g: Math.floor(Math.random() * 255),
            alpha: 1,
            life: Math.random() * 50 + 50
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        p.alpha = p.life / 100;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function update() {
    if (!gameRunning) return;

    if (keys.left) spaceship.x -= spaceship.speed;
    if (keys.right) spaceship.x += spaceship.speed;
    if (keys.up) spaceship.y -= spaceship.speed;
    if (keys.down) spaceship.y += spaceship.speed;

    spaceship.x = Math.max(0, Math.min(spaceship.x, canvas.width - spaceship.width));
    spaceship.y = Math.max(0, Math.min(spaceship.y, canvas.height - spaceship.height));

    bullets = bullets.filter(bullet => {
        bullet.y -= 5;
        return bullet.y > 0;
    });

    enemies = enemies.filter(enemy => {
        enemy.y += 2;
        return enemy.y < canvas.height;
    });

    bullets = bullets.filter(bullet => {
        for (let i = 0; i < enemies.length; i++) {
            if (bullet.x + 5 > enemies[i].x &&
                bullet.x < enemies[i].x + 50 &&
                bullet.y + 10 > enemies[i].y &&
                bullet.y < enemies[i].y + 50) {
                createExplosion(enemies[i].x + 25, enemies[i].y + 25);
                enemies.splice(i, 1);
                return false;
            }
        }
        return true;
    });

    for (let i = 0; i < enemies.length; i++) {
        if (spaceship.x + spaceship.width > enemies[i].x &&
            spaceship.x < enemies[i].x + breiteEnemy &&
            spaceship.y + spaceship.height > enemies[i].y &&
            spaceship.y < enemies[i].y + hoeheEnemy) {
            lives--;
            createExplosion(spaceship.x + spaceship.width / 2, spaceship.y + spaceship.height / 2);
            enemies.splice(i, 1);

            shakeTime = 30;
            shakeIntensity = 20;

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 50);

            break;
        }
    }

    updateParticles();

    if (shakeTime > 0) {
        shakeTime--;
        shakeIntensity *= 0.9;
    }

    if (lives === 0) {
        gameRunning = false;
        shakeTime = 0;
        shakeIntensity = 0;
        gameContainer.style.transform = 'none';
        gameOverOverlay.style.display = 'flex';
        gameOverScreenActive = true;
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpaceship();
    drawBullets();
    drawEnemies();
    drawParticles();
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Lives: ${lives}`, 10, 10);

    if (shakeTime > 0) {
        const shakeOffsetX = Math.random() * shakeIntensity - shakeIntensity / 2;
        const shakeOffsetY = Math.random() * shakeIntensity - shakeIntensity / 2;
        gameContainer.style.transform = `translate(${shakeOffsetX}px, ${shakeOffsetY}px)`;
    } else {
        gameContainer.style.transform = 'none';
    }
}

const keys = { left: false, right: false, up: false, down: false };

function updateVolume(change) {
    volume = Math.max(0, Math.min(1, volume + change));
    backgroundMusic.volume = volume;
    volumeControl.textContent = `Volume: ${Math.round(volume * 100)}%`;
}

document.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') {
        updateVolume(0.1);
        return;
    } else if (e.key === '-' || e.key === '_') {
        updateVolume(-0.1);
        return;
    }

    if (!gameRunning && !gameOverScreenActive && e.key.toLowerCase() === 'y') {
        startGame();
        return;
    }

    if (gameOverScreenActive) {
        if (e.key.toLowerCase() === 'y') {
            startGame();
        } else if (e.key.toLowerCase() === 'n') {
            showRabbitOverlay();
        }
        return;
    }

    if (!gameRunning) return;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === ' ') bullets.push({ x: spaceship.x + spaceship.width / 2 - 2.5, y: spaceship.y });
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
});

function spawnEnemy() {
    if (gameRunning) {
        enemies.push({ x: Math.random() * (canvas.width - breiteEnemy), y: 0 });
        setTimeout(spawnEnemy, 1000);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    lives = 3;
    enemies = [];
    bullets = [];
    particles = [];
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height - 50;
    gameRunning = true;
    gameOverScreenActive = false;
    startOverlay.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    rabbitOverlay.style.display = 'none';
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    spawnEnemy();
}

function showRabbitOverlay() {
    gameOverOverlay.style.display = 'none';
    rabbitOverlay.style.display = 'flex';
}

yesButton.addEventListener('click', startGame);
noButton.addEventListener('click', showRabbitOverlay);
document.getElementById('rabbitImage').addEventListener('click', startGame);

gameLoop();
