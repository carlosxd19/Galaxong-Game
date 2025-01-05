const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables del juego
let score = 0;
let shots = 0;
let enemiesDefeated = 0;
let gamePaused = false;
const radio = canvas.width / 2 - 30; // Radio del círculo
let timer = 60; // Temporizador de 1 minuto
let gameStarted = false; // Flag para controlar el inicio del juego

// Clase Nave (con diseño personalizado)
class Nave {
    constructor(x, y, angle) {
        this.x = x; // Coordenada X
        this.y = y; // Coordenada Y
        this.angle = angle; // Ángulo de rotación
        this.colorCuerpo = 'blue'; // Color del cuerpo principal
        this.colorAlas = 'red'; // Color de las alas
        this.colorBase = 'red'; // Color de la base
        this.moveLeft = false; // Control para mover a la izquierda
        this.moveRight = false; // Control para mover a la derecha
        this.moveUp = false; // Control para mover hacia arriba
        this.moveDown = false; // Control para mover hacia abajo
        this.speed = 5; // Velocidad de movimiento
    }

    dibujarNave() {
        ctx.save();
        ctx.translate(this.x, this.y); // Trasladar el origen al centro de la nave
        ctx.rotate(this.angle * Math.PI / 180); // Rotar según el ángulo

        // Cuerpo principal (triángulo)
        ctx.fillStyle = this.colorCuerpo;
        ctx.beginPath();
        ctx.moveTo(0, -25); // Punta de la nave
        ctx.lineTo(15, 10); // Esquina inferior derecha
        ctx.lineTo(-15, 10); // Esquina inferior izquierda
        ctx.closePath();
        ctx.fill();

        // Alas laterales (rectángulos)
        ctx.fillStyle = this.colorAlas;
        ctx.fillRect(-25, 5, 10, 20); // Ala izquierda
        ctx.fillRect(15, 5, 10, 20); // Ala derecha

        // Base (rectángulo en la parte inferior)
        ctx.fillStyle = this.colorBase;
        ctx.fillRect(-10, 10, 20, 10); // Base negra

        ctx.restore(); // Restaurar el contexto
    }

    actualizar() {
        // Movimiento según la rotación
        if (this.moveLeft) {
            this.x -= this.speed * Math.cos(this.angle * Math.PI / 180);
            this.y -= this.speed * Math.sin(this.angle * Math.PI / 180);
        }
        if (this.moveRight) {
            this.x += this.speed * Math.cos(this.angle * Math.PI / 180);
            this.y += this.speed * Math.sin(this.angle * Math.PI / 180);
        }
        if (this.moveUp) {
            this.x += this.speed * Math.sin(this.angle * Math.PI / 180);
            this.y -= this.speed * Math.cos(this.angle * Math.PI / 180);
        }
        if (this.moveDown) {
            this.x -= this.speed * Math.sin(this.angle * Math.PI / 180);
            this.y += this.speed * Math.cos(this.angle * Math.PI / 180);
        }

        // Mantener la nave dentro del círculo
        const distanciaAlCentro = Math.sqrt(Math.pow(this.x - canvas.width / 2, 2) + Math.pow(this.y - canvas.height / 2, 2));
        if (distanciaAlCentro > radio) {
            const angleToCenter = Math.atan2(this.y - canvas.height / 2, this.x - canvas.width / 2);
            this.x = canvas.width / 2 + radio * Math.cos(angleToCenter);
            this.y = canvas.height / 2 + radio * Math.sin(angleToCenter);
        }
    }

    rotar(direccion) {
        this.angle += direccion; // Cambiar el ángulo de rotación

        // Ajustar la rotación para que no se salga del círculo de 360° (+180 y -180 grados)
        if (this.angle >= 360) this.angle -= 360;
        if (this.angle < 0) this.angle += 360;
    }
}

// Clase Bicho (enemigos) con forma de calavera
class Bicho {
    constructor(x, y, colorBody, colorPatas, anchoBicho) {
        this.x = x;
        this.y = y;
        this.colorBody = colorBody;
        this.colorPatas = colorPatas;
        this.anchoBicho = anchoBicho; // Ancho del cuerpo del bicho
        this.alturaBicho = anchoBicho * 1.2; // Altura del cuerpo del bicho
        this.anchoOjos = 8; // Ojos grandes
        this.alturaOjos = 8; // Altura de los ojos grandes
    }

    dibujarBicho() {
        const mitadAnchoBicho = this.anchoBicho / 2;
        const mitadAlturaBicho = this.alturaBicho / 2;

        // Cuerpo (forma de calavera)
        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.anchoBicho / 2, 0, Math.PI, true); // Parte superior de la calavera
        ctx.lineTo(this.x - mitadAnchoBicho, this.y + mitadAlturaBicho); // Lado izquierdo
        ctx.lineTo(this.x + mitadAnchoBicho, this.y + mitadAlturaBicho); // Lado derecho
        ctx.closePath();
        ctx.fill();

        // Ojos (grandes, estilo calavera)
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x - mitadAnchoBicho / 1.5, this.y - mitadAlturaBicho / 2, this.anchoOjos, 0, Math.PI * 2); // Ojo izquierdo
        ctx.arc(this.x + mitadAnchoBicho / 1.5, this.y - mitadAlturaBicho / 2, this.anchoOjos, 0, Math.PI * 2); // Ojo derecho
        ctx.fill();

        // Pupilas de los ojos
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x - mitadAnchoBicho / 1.5, this.y - mitadAlturaBicho / 2, this.anchoOjos / 2, 0, Math.PI * 2); // Pupila izquierda
        ctx.arc(this.x + mitadAnchoBicho / 1.5, this.y - mitadAlturaBicho / 2, this.anchoOjos / 2, 0, Math.PI * 2); // Pupila derecha
        ctx.fill();

        // Detalle de la boca de la calavera (opcional, puedes agregar más detalles de calavera)
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + mitadAlturaBicho / 2, this.anchoBicho / 4, 0, Math.PI); // Boca de la calavera
        ctx.stroke();

        // Patas (4 patas)
        ctx.strokeStyle = this.colorPatas;
        ctx.lineWidth = 3;
        
        // Pata superior izquierda
        ctx.beginPath();
        ctx.moveTo(this.x - mitadAnchoBicho / 1.5, this.y - mitadAlturaBicho / 2);
        ctx.lineTo(this.x - mitadAnchoBicho / 1.5 - 10, this.y - mitadAlturaBicho / 2 - 20);
        ctx.stroke();
        
        // Pata superior derecha
        ctx.beginPath();
        ctx.moveTo(this.x + mitadAnchoBicho / 1.5, this.y - mitadAlturaBicho / 2);
        ctx.lineTo(this.x + mitadAnchoBicho / 1.5 + 10, this.y - mitadAlturaBicho / 2 - 20);
        ctx.stroke();
        
        // Pata inferior izquierda
        ctx.beginPath();
        ctx.moveTo(this.x - mitadAnchoBicho / 1.5, this.y + mitadAlturaBicho / 2);
        ctx.lineTo(this.x - mitadAnchoBicho / 1.5 - 10, this.y + mitadAlturaBicho / 2 + 20);
        ctx.stroke();
        
        // Pata inferior derecha
        ctx.beginPath();
        ctx.moveTo(this.x + mitadAnchoBicho / 1.5, this.y + mitadAlturaBicho / 2);
        ctx.lineTo(this.x + mitadAnchoBicho / 1.5 + 10, this.y + mitadAlturaBicho / 2 + 20);
        ctx.stroke();
    }
}


// Configuración de la nave (jugador)
const player = new Nave(canvas.width / 2, canvas.height - 50, 0);

// Configuración de los proyectiles
const projectiles = [];
function shoot() {
    projectiles.push({
        x: player.x,
        y: player.y - 20,
        radius: 5,
        speed: -7,
        color: 'white',
    });
    shots++;
    updateStats();
}

// Configuración de los enemigos (bichos)
const enemies = [];
function createEnemy() {
    const colors = ['red', 'green', 'blue', 'yellow'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newEnemy = new Bicho(Math.random() * (canvas.width - 40) + 20, -20, color, 'white', 30);
    enemies.push(newEnemy);
}

// Dibujar y mover enemigos
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.dibujarBicho();
        enemy.y += 2;

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

// Dibujar y mover proyectiles
function drawProjectiles() {
    projectiles.forEach((projectile, index) => {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fillStyle = projectile.color;
        ctx.fill();
        ctx.closePath();
        projectile.y += projectile.speed;

        if (projectile.y < 0) {
            projectiles.splice(index, 1);
        }
    });
}

// Detectar colisiones
function detectCollisions() {
    projectiles.forEach((projectile, pIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                projectile.x > enemy.x - enemy.anchoBicho / 2 &&
                projectile.x < enemy.x + enemy.anchoBicho / 2 &&
                projectile.y > enemy.y - enemy.anchoBicho / 2 &&
                projectile.y < enemy.y + enemy.anchoBicho / 2
            ) {
                projectiles.splice(pIndex, 1);
                enemies.splice(eIndex, 1);
                score += 10;
                enemiesDefeated++;
                updateStats();
            }
        });
    });
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('shots').textContent = shots;
    document.getElementById('enemies').textContent = enemiesDefeated;
}
// Mostrar mensaje de bienvenida y manejar inicio del juego
function showWelcomeMessage() {
    alert("Bienvenido al juego de Galaxong! El juego consiste en disparar a los enemigos que aparecerán en la pantalla. Debes hacer 200 puntos en 1 minuto. ¡Buena suerte!");
    gameStarted = true;
    startTimer();
}

// Iniciar temporizador
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gamePaused) {
            timer--;
            document.getElementById('timer').textContent = timer;

            if (timer <= 0) {
                clearInterval(timerInterval);
                if (score >= 200) {
                    alert("¡Enhorabuena! Has ganado el juego.");
                } else {
                    alert("No lograste ganar el juego. Vuelve a intentarlo.");
                }
                const restart = confirm("¿Quieres jugar de nuevo?");
                if (restart) {
                    location.reload();
                }
            }
        }
    }, 1000);
}

// Bucle principal del juego
function gameLoop() {
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.actualizar();
        player.dibujarNave();

        drawProjectiles();
        drawEnemies();
        detectCollisions();
    }

    requestAnimationFrame(gameLoop);
}

// Control de eventos para mover la nave y disparar
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') {
        player.moveLeft = true;  // Mover a la izquierda
    }
    if (e.code === 'ArrowRight') {
        player.moveRight = true; // Mover a la derecha
    }
    if (e.code === 'ArrowUp') {
        player.moveUp = true; // Mover hacia arriba
    }
    if (e.code === 'ArrowDown') {
        player.moveDown = true; // Mover hacia abajo
    }
    if (e.code === 'Space') shoot();
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') player.moveLeft = false;
    if (e.code === 'ArrowRight') player.moveRight = false;
    if (e.code === 'ArrowUp') player.moveUp = false;
    if (e.code === 'ArrowDown') player.moveDown = false;
});

// Botones de la interfaz
document.getElementById('pauseButton').addEventListener('click', () => {
    gamePaused = !gamePaused;
    document.getElementById('pauseButton').textContent = gamePaused ? 'Reanudar' : 'Pausar';
});

document.getElementById('restartButton').addEventListener('click', () => {
    location.reload();
});

document.getElementById('exitButton').addEventListener('click', () => {
    alert('Gracias por jugar!');
    window.close();
});

// Crear enemigos cada cierto tiempo
setInterval(() => {
    if (!gamePaused) createEnemy();
}, 2000);
// Llamar a la pantalla de bienvenida
showWelcomeMessage();
// Iniciar el juego
updateStats();
gameLoop();
