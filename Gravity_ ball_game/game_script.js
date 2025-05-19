const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY_CONSTANT = 100; 
const MIN_GRAVITY_DISTANCE_SQ = 50 * 50; 

const levels = [
    {
        startPoint: { x: 50, y: canvas.height / 2, radius: 15, color: 'green' },
        endPoint: { x: canvas.width - 50, y: canvas.height / 2, radius: 15, color: 'red' },
        planets: [
            { x: 200, y: 300, mass: 3000, radius: 25, color: 'lightblue', isStationary: true },
            { x: 600, y: 300, mass: -2000, radius: 20, color: 'orange' } 
        ]
        
    },
     {
        startPoint: { x: 50, y: 100, radius: 15, color: 'green' },
        endPoint: { x: canvas.width - 50, y: canvas.height - 100, radius: 15, color: 'red' },
        planets: [
            { x: 400, y: 300, mass: 5000, radius: 30, color: 'lightblue', isStationary: true }, 
            { x: 200, y: 450, mass: 2000, radius: 20, color: 'lightblue' },
            { x: 600, y: 150, mass: -2000, radius: 20, color: 'orange' } 
        ]
         
    },
     {
        startPoint: { x: canvas.width / 2, y: 50, radius: 15, color: 'green' },
        endPoint: { x: canvas.width / 2, y: canvas.height - 50, radius: 15, color: 'red' },
        planets: [
            { x: 200, y: canvas.height / 2, mass: -4000, radius: 25, color: 'orange', isStationary: true }, 
            { x: 600, y: canvas.height / 2, mass: 4000, radius: 25, color: 'lightblue' },  
            { x: 100, y: 100, mass: 1000, radius: 15, color: 'lightblue', isStationary: true } 
        ]
    }
];

let ball = {
    x: 0,
    y: 0,
    vx: 0, 
    vy: 0, 
    radius: 10,
    color: 'white',
    isMoving: false
};

let planets = []; 
let startPoint = {}; 
let endPoint = {}; 

let gameState = 'setup'; // 'setup', 'playing', 'win', 'lose', 'complete'
let currentLevelIndex = 0; 

let draggedPlanet = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function initLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        gameState = 'complete';
        console.log("Игра пройдена!");
        return;
    }

    currentLevelIndex = levelIndex;
    const levelData = levels[currentLevelIndex];

    ball.x = levelData.startPoint.x;
    ball.y = levelData.startPoint.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.isMoving = false;
    ball.radius = 10; 

    planets = levelData.planets.map(p => ({ ...p, isDragging: false }));

    startPoint = { ...levelData.startPoint };
    endPoint = { ...levelData.endPoint };

    gameState = 'setup';
    draggedPlanet = null; 
    console.log(`Загружен уровень ${currentLevelIndex + 1}`);
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function getTouchPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
    };
}


function onMouseDown(event) {
    if (gameState !== 'setup') return; 

    const mousePos = getMousePos(event);

    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];

        if (planet.isStationary) {
            continue;
        }

        const distSq = (mousePos.x - planet.x) ** 2 + (mousePos.y - planet.y) ** 2;
        if (distSq < planet.radius ** 2) {
            draggedPlanet = planet;
            dragOffsetX = mousePos.x - planet.x;
            dragOffsetY = mousePos.y - planet.y;
            planet.isDragging = true;
            break; 
        }
    }
}

function onMouseMove(event) {
    if (draggedPlanet && gameState === 'setup') {
        const mousePos = getMousePos(event);
        draggedPlanet.x = mousePos.x - dragOffsetX;
        draggedPlanet.y = mousePos.y - dragOffsetY;
        drawScene(); 
    }
}

function onMouseUp(event) {
     if (draggedPlanet && gameState === 'setup') {
        draggedPlanet.isDragging = false; 
        draggedPlanet = null; 
    }
    if (gameState === 'setup' && !draggedPlanet) { 
         const mousePos = getMousePos(event);
         const distSqToBall = (mousePos.x - ball.x) ** 2 + (mousePos.y - ball.y) ** 2;
         if (distSqToBall < ball.radius ** 2 * 4) {
             ball.isMoving = true;
             gameState = 'playing';
             console.log("Шарик запущен!");
         }
    } else if (gameState === 'complete') {
         initLevel(0);
         console.log("Перезапуск игры с Уровня 1");
    }
}

function onTouchStart(event) {
    if (gameState !== 'setup' || event.touches.length > 1) return;
    event.preventDefault();
    const touchPos = getTouchPos(event);

     for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        if (planet.isStationary) {
            continue;
        }

        const distSq = (touchPos.x - planet.x) ** 2 + (touchPos.y - planet.y) ** 2;
        if (distSq < planet.radius ** 2 * 2) { 
            draggedPlanet = planet;
            dragOffsetX = touchPos.x - planet.x;
            dragOffsetY = touchPos.y - planet.y;
            planet.isDragging = true;
            break;
        }
    }
}

function onTouchMove(event) {
     if (draggedPlanet && gameState === 'setup' && event.touches.length === 1) {
        event.preventDefault();
        const touchPos = getTouchPos(event);
        draggedPlanet.x = touchPos.x - dragOffsetX;
        draggedPlanet.y = touchPos.y - dragOffsetY;
        drawScene();
    }
}

function onTouchEnd(event) {
    if (draggedPlanet && gameState === 'setup') {
        draggedPlanet.isDragging = false;
        draggedPlanet = null;
    }
    if (gameState === 'setup' && !draggedPlanet && event.changedTouches.length === 1) {
         const touchPos = {
            x: event.changedTouches[0].clientX - canvas.getBoundingClientRect().left,
            y: event.changedTouches[0].clientY - canvas.getBoundingClientRect().top
         };
         const distSqToBall = (touchPos.x - ball.x) ** 2 + (ball.y - ball.y) ** 2; 
         const distSqToBallCorrected = (touchPos.x - ball.x) ** 2 + (touchPos.y - ball.y) ** 2;
         if (distSqToBallCorrected < ball.radius ** 2 * 4) {
             ball.isMoving = true;
             gameState = 'playing';
             console.log("Шарик запущен!");
         }
    } else if (gameState === 'complete') {
         initLevel(0);
         console.log("Перезапуск игры с Уровня 1 (по тапу)");
    }
}

function updateBall(deltaTime) {
    if (!ball.isMoving) return;

    let totalAx = 0;
    let totalAy = 0;

    planets.forEach(planet => {
        const dx = planet.x - ball.x;
        const dy = planet.y - ball.y;
        const distSq = dx * dx + dy * dy;

        const safeDistSq = Math.max(distSq, MIN_GRAVITY_DISTANCE_SQ);
        const distance = Math.sqrt(safeDistSq);

        const acceleration = (GRAVITY_CONSTANT * planet.mass) / safeDistSq;

        const ax = acceleration * (dx / distance);
        const ay = acceleration * (dy / distance);

        totalAx += ax;
        totalAy += ay;
    });

    ball.vx += totalAx * deltaTime;
    ball.vy += totalAy * deltaTime;

    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPlanet(planet) {
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color;
    ctx.fill();

    if (planet.isStationary) {
        ctx.strokeStyle = 'gold'; 
        ctx.lineWidth = 3; 
        ctx.stroke();
    }

    ctx.closePath();
}

function drawStartPoint() {
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, startPoint.radius, 0, Math.PI * 2);
    ctx.fillStyle = startPoint.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawEndPoint() {
     ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, endPoint.radius, 0, Math.PI * 2);
    ctx.fillStyle = endPoint.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawText(text, color, fontSize = 30, yOffset = 0) {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + yOffset);
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStartPoint();
    drawEndPoint();
    planets.forEach(drawPlanet);
    drawBall(); 

    if (gameState === 'win') {
        drawText("ПОБЕДА!", 'green');
        drawText(`Уровень ${currentLevelIndex + 1} пройден!`, 'white', 20, 40);
    } else if (gameState === 'lose') {
        drawText("ПОРАЖЕНИЕ!", 'red');
        drawText(`Уровень ${currentLevelIndex + 1}`, 'white', 20, 40);
    } else if (gameState === 'setup') {
         drawText(`Уровень ${currentLevelIndex + 1}`, 'white', 24, -canvas.height / 2 + 40);
         drawText("Перетащите планеты. Нажмите на шарик для запуска.", 'white', 18, canvas.height / 2 - 40);
         drawText("Планеты с золотой рамкой неподвижны.", 'gold', 16, canvas.height / 2 - 10);
    } else if (gameState === 'complete') {
        drawText("ИГРА ПРОЙДЕНА!", 'green', 40);
        drawText("Нажмите для начала сначала", 'white', 20, 60);
    }
}


function checkGameStatus() {
    if (gameState !== 'playing') return;

    const distSqToEnd = (ball.x - endPoint.x) ** 2 + (ball.y - endPoint.y) ** 2;
    const winDistance = endPoint.radius + ball.radius;
    if (distSqToEnd < winDistance * winDistance) {
        gameState = 'win';
        ball.isMoving = false;
        console.log(`Уровень ${currentLevelIndex + 1} пройден!`);
        setTimeout(() => {
            initLevel(currentLevelIndex + 1);
        }, 3000); 
        return; 
    }

    if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) {
        gameState = 'lose';
        ball.isMoving = false;
        console.log(`Уровень ${currentLevelIndex + 1}: Вылетел за границы!`);
        setTimeout(() => {
            initLevel(currentLevelIndex);
        }, 3000); 
        return;
    }

}

let lastTime = 0;
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (gameState === 'playing') {
        updateBall(deltaTime);
    }

    checkGameStatus(); 

    drawScene();

    requestAnimationFrame(gameLoop);
}

initLevel(0); 
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('touchstart', onTouchStart);
canvas.addEventListener('touchmove', onTouchMove);
canvas.addEventListener('touchend', onTouchEnd);

gameLoop(0); 