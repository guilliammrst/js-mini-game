const player = document.querySelector("#player");
const game = document.querySelector("#game");
const statsContainer = document.getElementById("stats-display");
const body = document.querySelector("body");

// Constantes du jeu
const startingPlayerX = 50;
const startingPlayerY = 10;
const playerWidth = player.offsetWidth;
const playerHeight = player.offsetHeight;
const gameWidth = game.offsetWidth;

// Variables du joueur
let playerX = startingPlayerX;
let playerY = startingPlayerY;
let isJumping = false;
let isCrouching = false;
let isFighting = false;
let canFight = true;
let fightCooldown = 5000;
let jumpHeight = 200;
let rocketKillPoints = 15;

let isGameOver = false;
let isGamePaused = false;
let lives = 3;
let score = 0;

const keys = {};
const STATS_KEY = "game_stats";

displayMenuStats();

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === "ArrowUp") jump();
    if (e.key === "ArrowDown") crouch();
    if (e.key === "Escape") !isGamePaused ? pauseGame() : resumeGame();
    if (e.code === "Space") fight();
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;

    if (e.key === "ArrowDown" && !isJumping) {
        standUp();
    }
});

document.querySelector("#start-btn").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    startGame();
});

document.querySelectorAll(".character").forEach((char) => {
    char.addEventListener("click", () => {
        document.querySelectorAll(".character").forEach(c => c.classList.remove("selected"))
        char.classList.add("selected")
        player.classList.remove("bowser", "pikachu", "darth-vader")
        player.classList.add(char.dataset.character)
    })
})

// Fonction pour démarrer le jeu
function startGame() {
    updateBackground();
    playCharSound();
    updatePlayer();
    loopRocketGenerator();
    updateHUD();
    scoreUpdator();
}

// Fonction pour mettre à jour l'arrière-plan
function updateBackground() {
    if (player.classList.contains("bowser")) body.style.backgroundImage = 'url("assets/background-bowser.jpg")';
    if (player.classList.contains("pikachu")) body.style.backgroundImage = 'url("assets/background-pikachu.jpg")';
    if (player.classList.contains("darth-vader")) body.style.backgroundImage = 'url("assets/background-darth-vader.jpg")';
}

// Fonction pour jouer le son du personnage
function playCharSound() {
    if (player.classList.contains("bowser")) {
        const sound = new Audio("assets/sounds/bowser.wav");
        sound.volume = 0.1;
        sound.play();
    }
    if (player.classList.contains("pikachu")) {
        const sound = new Audio("assets/sounds/pikachu.mp3");
        sound.volume = 0.1;
        sound.play();
    }
    if (player.classList.contains("darth-vader")) {
        const sound = new Audio("assets/sounds/darth-vader.mp3");
        sound.volume = 0.1;
        sound.play();
    }
}

// Fonction pour mettre à jour la position du joueur
function updatePlayer() {
    if (!isFighting && !isCrouching && !isGamePaused)
    {
        if (keys["ArrowRight"] && playerX <= gameWidth - playerWidth) playerX += 2;
        if (keys["ArrowLeft"] && playerX >= 0) playerX -= 2;

        player.style.left = playerX + "px";
        player.style.bottom = playerY + "px";
    }

    requestAnimationFrame(updatePlayer);
}

// Fonction pour faire sauter le joueur
function jump() {
    if (isJumping || isCrouching || isGamePaused) return;
    isJumping = true;

    if (player.classList.contains("bowser")) player.style.backgroundImage = 'url("assets/jumping-bowser.png")';
    if (player.classList.contains("pikachu")) player.style.backgroundImage = 'url("assets/jumping-pikachu.png")';
    if (player.classList.contains("darth-vader")) player.style.backgroundImage = 'url("assets/jumping-darth-vader.png")';

    const sound = new Audio("assets/sounds/jump.mp3");
    sound.volume = 0.1;
    sound.play();

    let upInterval = setInterval(() => {
        if (playerY >= jumpHeight) {
            clearInterval(upInterval);

            let downInterval = setInterval(() => {
                if (playerY <= startingPlayerY) {
                    clearInterval(downInterval);
                    isJumping = false;

                    if (player.classList.contains("bowser")) player.style.backgroundImage = 'url("assets/bowser.png")';
                    if (player.classList.contains("pikachu")) player.style.backgroundImage = 'url("assets/pikachu.png")';
                    if (player.classList.contains("darth-vader")) player.style.backgroundImage = 'url("assets/darth-vader.png")';
                } else {
                    if (isGamePaused) return;
                    playerY -= 5;
                }
            }, 12);
        } else {
            if (isGamePaused) return;
            playerY += 5;
        }
    }, 12);
}

// Fonction pour s'accroupir
function crouch() {
    if (isJumping || isGamePaused) return;

    if (player.classList.contains("bowser")) {
        player.style.backgroundImage = 'url("assets/shell-bowser.png")';
        player.style.height = "64px";
        player.style.width = "59px";
        player.style.bottom = "15px";

        if (!isCrouching) {
            const sound = new Audio("assets/sounds/bowser-crouch.mp3");
            sound.volume = 0.25;
            sound.play();
        }
    }
    if (player.classList.contains("pikachu")) {
        player.style.backgroundImage = 'url("assets/sleepy-pikachu.png")';
        player.style.height = "50px";
        player.style.width = "60px";
        player.style.bottom = "10px";

        if (!isCrouching) {
            const sound = new Audio("assets/sounds/sleeping.mp3");
            sound.play();
        }
    }
    if (player.classList.contains("darth-vader")) {
        player.style.backgroundImage = 'url("assets/little-darth-vader.png")';
        player.style.height = "50px";
        player.style.width = "60px";
        player.style.bottom = "10px";

        if (!isCrouching) {
            const sound = new Audio("assets/sounds/breathing.mp3");
            sound.play();
        }
    }

    isCrouching = true;
}

// Fonction pour combattre
function fight() {
    if (!canFight || isJumping || isCrouching || isGamePaused) return;

    canFight = false;
    isFighting = true;

    if (player.classList.contains("bowser")) {
        const sound = new Audio("assets/sounds/roar.mp3");
        sound.volume = 0.8;
        sound.play();
        player.style.backgroundImage = 'url("assets/fighting-bowser.png")';
    } 
    if (player.classList.contains("pikachu")) {
        const sound = new Audio("assets/sounds/thunder.mp3");
        sound.volume = 0.8;
        sound.play();
        player.style.backgroundImage = 'url("assets/fighting-pikachu.png")';
    }
    if (player.classList.contains("darth-vader")) {
        const sound = new Audio("assets/sounds/laser.mp3");
        sound.volume = 0.8;
        sound.play();
        player.style.backgroundImage = 'url("assets/fighting-darth-vader.png")';
    }

    player.style.height = "120px";
    player.style.width = "200px";
    player.style.bottom = "15px";

    setTimeout(() => {
        if (player.classList.contains("bowser")) player.style.backgroundImage = 'url("assets/bowser.png")';
        if (player.classList.contains("pikachu")) player.style.backgroundImage = 'url("assets/pikachu.png")';
        if (player.classList.contains("darth-vader")) player.style.backgroundImage = 'url("assets/darth-vader.png")';

        player.style.height = playerHeight + "px";
        player.style.width = playerWidth + "px"; 
        isFighting = false;
    }, 250);

    setTimeout(() => {
        canFight = true;
    }, fightCooldown);

    // Affiche le timer
    const fightTimer = document.getElementById("fighting-timer");
    let cooldownTime = fightCooldown/1000;
    fightTimer.classList.remove("hidden");
    fightTimer.textContent = cooldownTime.toFixed(1);

    const timerInterval = setInterval(() => {
        if (isGamePaused) return;

        cooldownTime -= 0.1;
        if (cooldownTime <= 0) {
            clearInterval(timerInterval);
            fightTimer.classList.add("hidden");
        } else {
            fightTimer.textContent = cooldownTime.toFixed(1);
        }
    }, 100);
}

// Fonction pour se relever
function standUp() {
    if (isGamePaused || !isCrouching) return;

    isCrouching = false;

    if (player.classList.contains("bowser")) player.style.backgroundImage = 'url("assets/bowser.png")';
    if (player.classList.contains("pikachu")) player.style.backgroundImage = 'url("assets/pikachu.png")';
    if (player.classList.contains("darth-vader")) player.style.backgroundImage = 'url("assets/darth-vader.png")';

    player.style.height = playerHeight + "px";
    player.style.width = playerWidth + "px"; 
}

// Fonction pour faire apparaître une fusée
function summonRocket() {
    if (isGameOver || isGamePaused) return;

    const rocket = document.createElement("div");
    rocket.classList.add("rocket");

    game.appendChild(rocket);

    let rocketX = (gameWidth - 50);
    rocket.style.left = rocketX + "px";

    let rocketY = Math.floor(Math.random() * (game.offsetHeight - 300));
    rocket.style.bottom = rocketY + "px";

    const rocketInterval = setInterval(() => {
        if (rocketX <= 0) {
            clearInterval(rocketInterval);
            score += 5;
            game.removeChild(rocket);
        } else {
            if (isGameOver || isGamePaused) return;

            rocketX -= 5;
            rocket.style.left = rocketX + "px";
            if (checkCollision(rocket)) {
                clearInterval(rocketInterval);
                game.removeChild(rocket);

                if (isFighting) {
                    score += rocketKillPoints;
                    showScorePopup(rocketX, rocketY, "+" + rocketKillPoints);
                }
                else {
                    blinkPlayer();
                    
                    if (player.classList.contains("bowser")) {
                        const sound = new Audio("assets/sounds/fart.mp3");
                        sound.volume = 0.8;
                        sound.play();
                    }

                    if (player.classList.contains("pikachu")) {
                        const sound = new Audio("assets/sounds/burp.mp3");
                        sound.volume = 0.8;
                        sound.play();
                    }

                    if (player.classList.contains("darth-vader")) {
                        const sound = new Audio("assets/sounds/damage.mp3");
                        sound.volume = 0.8;
                        sound.play();
                    }
    
                    if (!isGameOver) {
                        lives--;
                        updateLivesDisplay();
    
                        if (lives <= 0) {
                            gameOver();
                        }
                        else {
                            console.log("Il vous reste " + lives + " vies !");
                        }
                    }
                }
            }
        }
    }, 15);
}

// Fonction pour avoir le delai d'apparition des fusées
function getRocketDelay() {
    if (score < 20) return 2500;
    if (score < 50) return 2000;
    if (score < 100) return 1500;
    if (score < 150) return 1250;
    return 1000;
}

// Fonction pour faire apparaître une fusée à un intervalle aléatoire
function loopRocketGenerator() {
    summonRocket();
    const delay = getRocketDelay();
    setTimeout(loopRocketGenerator, delay);
}

// Fonction pour checker la collision entre le joueur et la fusée
function checkCollision(rocket) {
    const rocketRect = rocket.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    return !(
        playerRect.top > rocketRect.bottom ||
        playerRect.bottom < rocketRect.top ||
        playerRect.right < rocketRect.left ||
        playerRect.left > rocketRect.right
    );
}

// Fonction pour faire clignoter le joueur
function blinkPlayer() {
    let visible = true;

    const blinkInterval = setInterval(() => {
        player.style.opacity = visible ? "0.3" : "1";
        visible = !visible;
    }, 200);

    setTimeout(() => {
        clearInterval(blinkInterval);
        player.style.opacity = "1";
    }, 1250);
}

// Fonction pour mettre à jour le HUD
function updateHUD() {
    updateLivesDisplay();
    updateScoreDisplay();
}

// Fonction pour mettre à jour l'affichage des vies restantes
function updateLivesDisplay() {
    const livesDisplay = document.getElementById("lives-display");
    livesDisplay.classList.remove("hidden");
    livesDisplay.innerHTML = "";

    for (let i = 0; i < lives; i++) {
        const lifeImg = document.createElement("img");
        lifeImg.src = "assets/life-point.webp";
        lifeImg.alt = "Vie";
        lifeImg.classList.add("life-icon");
        livesDisplay.appendChild(lifeImg);
    }
}

// Fonction pour le score 
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById("score-display");
    scoreDisplay.innerHTML = "Score: " + score;
}

// Fonction pour afficher un gain de score dans une popup
function showScorePopup(x, y, text) {
    const popup = document.createElement("div");
    popup.classList.add("score-popup");
    popup.textContent = text;

    const container = document.getElementById("score-popup-container");
    container.appendChild(popup);

    popup.style.left = x + "px";
    popup.style.bottom = y + "px";

    setTimeout(() => {
        container.removeChild(popup);
    }, 1000);
}

// Fonction pour mettre à jour le score
function scoreUpdator() {
    setInterval(() => {
        if (isGameOver || isGamePaused) return;
        score++;
        updateScoreDisplay();
    }, 1000);
}

// Fonction pour redémarrer le jeu
function restartGame() {
    score = 0;
    lives = 3;
    isGameOver = false;
    playerX = startingPlayerX;
    playerY = startingPlayerY;
    player.style.left = playerX + "px";
    player.style.bottom = playerY + "px";
    const gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.classList.add("hidden");
    statsContainer.classList.add("hidden");
    console.log("Jeu redémarré !");
    updateHUD();
}

// Fonction game over
function gameOver() {
    if (player.classList.contains("bowser")) {
        const sound = new Audio("assets/sounds/death.mp3");
        sound.volume = 0.8;
        sound.play();
    }
    if (player.classList.contains("pikachu")) {
        const sound = new Audio("assets/sounds/pokecenter-healing.mp3");
        sound.volume = 0.8;
        sound.play();
    }
    if (player.classList.contains("darth-vader")) {
        const sound = new Audio("assets/sounds/darth-vader-death.mp3");
        sound.volume = 0.8;
        sound.play();
    }
    
    const livesDisplay = document.getElementById("lives-display");
    livesDisplay.classList.add("hidden");

    const gameOver = document.getElementById("game-over-screen");
    const restartButton = document.getElementById("restart-button");
    
    isGameOver = true;
    gameOver.classList.remove("hidden");
    console.log("Game Over !");

    restartButton.addEventListener("click", restartGame);    

    const isWin = score >= 100;
    saveGame(score, isWin);
    displayStats();
}

// Fonction pour mettre le jeu en pause
function pauseGame() {
    if (isGameOver) return;

    const pauseScreen = document.getElementById("pause-screen");
    const resumeButton = document.getElementById("resume-button");
    pauseScreen.classList.remove("hidden");
    resumeButton.addEventListener("click", resumeGame);

    isGamePaused = true;
    console.log("Jeu en pause !");
}

// Fonction pour reprendre le jeu
function resumeGame() {
    const pauseScreen = document.getElementById("pause-screen");
    pauseScreen.classList.add("hidden");

    isGamePaused = false;
    standUp();
    console.log("Jeu repris !");
}

// Fonction pour récupérer les statistiques de jeu
function getStats() {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || [];
}

// Fonction pour sauvegarder les statistiques de jeu
function saveGame(score, isWin) {
    let character = "Inconnu";

    if (player.classList.contains("bowser")) character = "Bowser";
    if (player.classList.contains("pikachu")) character = "Pikachu";
    if (player.classList.contains("darth-vader")) character = "Darth Vader";

    const stats = getStats();
    stats.push({ score, isWin, character });
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Fonction pour calculer les statistiques
function calculateStats() {
    const stats = getStats();
    const totalGames = stats.length;

    const totalScore = stats.reduce((sum, game) => sum + game.score, 0);
    const avgScore = totalGames > 0 ? (totalScore / totalGames).toFixed(1) : 0;

    const scores = stats.map(game => game.score);
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;

    const victories = stats.filter(game => game.isWin);
    const winRate = totalGames > 0 ? ((victories.length / totalGames) * 100).toFixed(1) : 0;

    const charCount = stats.reduce((acc, game) => {
        acc[game.character] = (acc[game.character] || 0) + 1;
        return acc;
    }, {});

    const mainChar = Object.entries(charCount).length > 0
    ? Object.entries(charCount).reduce((maxChar, currChar) => {
        return currChar[1] > maxChar[1] ? currChar : maxChar;
      }, ["None", 0])[0]
    : "Aucun";

    return {
        totalGames,
        avgScore,
        topScore,
        winRate,
        mainChar
    };
}

// Fonction pour afficher les statistiques
function displayStats() {
    const stats = calculateStats();
    const statsList = document.getElementById("stats-list");
    statsList.innerHTML = `
        Nombre de parties : ${stats.totalGames}<br>
        Score moyen : ${stats.avgScore}<br>
        Meilleur score : ${stats.topScore}<br>
        Taux de victoire : ${stats.winRate}%<br>
        Perso principal : ${stats.mainChar}
    `;
    statsContainer.classList.remove("hidden");
}

// Fonction pour afficher les statistiques
function displayMenuStats() {
    const stats = calculateStats();
    const statsList = document.getElementById("menu-stats-list");
    statsList.innerHTML = `
        Nombre de parties : ${stats.totalGames}<br>
        Score moyen : ${stats.avgScore}<br>
        Meilleur score : ${stats.topScore}<br>
        Taux de victoire : ${stats.winRate}%<br>
        Perso principal : ${stats.mainChar}
    `;
    const statsContainer = document.getElementById("menu-stats-display");
    statsContainer.classList.remove("hidden");
}

