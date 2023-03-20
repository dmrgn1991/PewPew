const svgNS = "http://www.w3.org/2000/svg";
let gameScreen = document.getElementById("screen")
let svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "800");
svg.setAttribute("height", "800");
let scrn;
let gameWidth;
let gameHeight;

let state = 0;

let starSpeed = 2;

let enemies = [];
let bullets = [];
let stars = [];
let explosions = [];
let enemyBullets = [];
let powerUps = [];

let canShoot = true;
let score = 0;
let scoreCounter;
let hiScore = 0;
let hiScoreCounter;

let shotTimer = 600;
let tripShot = false;
let tripleThreshold = 100;
let shield = 0;
let fireThreshold = 50;

let currentWave = 0;
let waves = [[1,2,1,2,1],[3,1,3,1],[2,2,2,1,2,1,2],[3,1,2,3,1,2],[1,2,3,1,2,3],[3,1,2,3,1,2]];
let waveIndex = 0;



let bgm = new Audio('assets/BGM.wav');
bgm.volume = 0.5;
bgm.loop = true;

document.addEventListener('pointerlockchange', function () {
    isPointerLocked = true;
}, false);
document.addEventListener('mozpointerlockchange', function () {
    isPointerLocked = true;
}, false);

let background = document.createElementNS(svgNS, "rect");
background.setAttribute("width", `${svg.getAttribute("width")}`);
background.setAttribute("height", svg.getAttribute("height"));
background.setAttribute("fill", "black");

let playerSprite = document.createElementNS(svgNS, "g");
playerSprite.setAttribute("width", "80");
playerSprite.setAttribute("height", "80");

let playerSpriteBase = document.createElementNS(svgNS, "rect");
playerSpriteBase.setAttribute("width", "48");
playerSpriteBase.setAttribute("height", "80");
playerSpriteBase.setAttribute("x", "0");
playerSpriteBase.setAttribute("y", "0");
playerSpriteBase.setAttribute("fill", "transparent");

let playerCockPit = document.createElementNS(svgNS, "ellipse");
playerCockPit.setAttribute("cx", "40");
playerCockPit.setAttribute("cy", "32");
playerCockPit.setAttribute("rx", "6");
playerCockPit.setAttribute("ry", "9");
playerCockPit.setAttribute("fill", "url(#cockpit-gradient)");
playerCockPit.setAttribute("stroke", "#666");

let playerBody = document.createElementNS(svgNS, "polygon");
playerBody.setAttribute("points", "0,80 40,0, 80,80, 40,55");
playerBody.setAttribute("fill", "url(#body-gradient)");
playerBody.setAttribute("stroke", "#333");

let playerThruster = document.createElementNS(svgNS, "polygon");
playerThruster.setAttribute("points", "25,72 32,56 48,56 54,72");
playerThruster.setAttribute("fill", "#444");

let playerBurner = document.createElementNS(svgNS, "polygon");
playerBurner.setAttribute("points", "25,72 40,80, 54,72");
playerBurner.setAttribute("fill", "cyan");
playerBurner.setAttribute("stroke", "blue")

let playerNosePaint = document.createElementNS(svgNS, "polygon");
playerNosePaint.setAttribute("points", "28,24  40,0, 52,24, 40, 14");
playerNosePaint.setAttribute("fill", "blue");

let playerStripeRight = document.createElementNS(svgNS, "polygon");
playerStripeRight.setAttribute("points", "40,60 50,64 68,54 64,48 ");
playerStripeRight.setAttribute("fill", "#333");

let playerStripeLeft = document.createElementNS(svgNS, "polygon");
playerStripeLeft.setAttribute("points", "40,60 28,64 12,54 16,48 ");
playerStripeLeft.setAttribute("fill", "#333");

let playerStripeCenter = document.createElementNS(svgNS, "rect");
playerStripeCenter.setAttribute("x", "35");
playerStripeCenter.setAttribute("y", "24");
playerStripeCenter.setAttribute("width", "10");
playerStripeCenter.setAttribute("height", "32");
playerStripeCenter.setAttribute("fill", "#333");

let playerShield = document.createElementNS(svgNS, "ellipse");
playerShield.setAttribute("cx", "40");
playerShield.setAttribute("cy", "40");
playerShield.setAttribute("rx", "50");
playerShield.setAttribute("ry", "50");
playerShield.setAttribute("fill", "transparent");
playerShield.setAttribute("fill-opacity", "0.3");
playerShield.setAttribute("stroke", "transparent");;
playerShield.setAttribute("stroke-width", "8");

let text = document.createElementNS(svgNS, "text");
text.setAttribute("x", "50%");
text.setAttribute("y", "50%");
text.setAttribute("text-anchor", "middle");
text.setAttribute("alignment-baseline", "middle");
text.setAttribute("fill", "#fff");
text.setAttribute("font-size", "24px");
text.setAttribute("font-family", "VT323");
text.textContent = "Click to Start Game";
text.style.pointerEvents = "none";

/** 
 * Animates the player sprite
 */
function animatePlayer() {
    burnerColor = playerBurner.getAttribute("fill");

    shieldColor = playerShield.getAttribute("stroke");
    if (burnerColor == "cyan") {
        burnerColor = "blue";
        playerBurner.setAttribute("points", "25,72 40,75, 54,72");
    } else {
        burnerColor = "cyan";
        playerBurner.setAttribute("points", "25,72 40,80, 54,72")

    }
    playerBurner.setAttribute("fill", burnerColor);

    if (shield > 0) {
        if (shieldColor == "transparent") {
            shieldColor = "cyan";
        } else {
            shieldColor = "transparent";
        }
        playerShield.setAttribute("stroke", shieldColor);
        playerShield.setAttribute("fill", shieldColor);
    } else {
        playerShield.setAttribute("stroke", "transparent");
        playerShield.setAttribute("fill", "transparent");
    }
}
/** 
 * Generates exlosion rings
 *  @param {x} x position
 *  @param {y} y position
 */
function generateExplosion(x, y) {

    let thisExplosion = document.createElementNS(svgNS, "circle");
    cx = parseInt(x) + 50;
    cy = parseInt(y) + 50;
    thisExplosion.setAttribute("stroke-width", "12")
    thisExplosion.setAttribute("stroke", "orange");
    thisExplosion.setAttribute("cx", cx);
    thisExplosion.setAttribute("cy", cy);
    thisExplosion.setAttribute("r", "10");
    thisExplosion.setAttribute("stroke-opacity", "1");
    thisExplosion.setAttribute("fill", "transparent");
    svg.appendChild(thisExplosion);
    explosions.push(thisExplosion);
    let boomSFX = new Audio('assets/boomSFX.wav');
    boomSFX.volume = 0.5;
    boomSFX.play();

}

/**
 * Randomly generates scrolling stars
 */
function generateStars() {

    let randomX = Math.floor(Math.random() * (gameWidth));
    let randomY = Math.floor(Math.random() * gameHeight);
    let randomSize = Math.floor(Math.random() * 3);
    let thisStar = document.createElementNS(svgNS, "circle");
    thisStar.setAttribute("r", randomSize);
    thisStar.setAttribute("fill", "white");
    thisStar.setAttribute("cx", randomX);
    thisStar.setAttribute("cy", randomY);
    svg.appendChild(thisStar);
    stars.push(thisStar);
}

/**
 * Actually handles star generation
 */
setInterval(function () {
    if (stars.length < 80) {
        generateStars();
    }
}, 30)

/** 
 * Initializes some variables and sets up screen * 
 */
function initialize() {
    let main = document.getElementById("main");
    main.appendChild(svg);

    scrn = svg.getBoundingClientRect();
    gameWidth = scrn.width;
    gameHeight = scrn.height;


    playerSpriteBase.setAttribute("y", `${gameHeight-120}`)
    background.style.pointerEvents = "none";
    svg.appendChild(background);
    svg.appendChild(text);


    playerSprite.appendChild(playerBody);
    playerSprite.appendChild(playerNosePaint);
    playerSprite.appendChild(playerStripeRight);
    playerSprite.appendChild(playerStripeLeft);
    playerSprite.appendChild(playerStripeCenter);
    playerSprite.appendChild(playerCockPit);
    playerSprite.appendChild(playerThruster);
    playerSprite.appendChild(playerBurner);
    playerSprite.appendChild(playerShield);
    svg.style.border = "20px solid silver";

    scoreCounter = document.getElementById("score");
    hiScoreCounter = document.getElementById("hiScore");

    scoreCounter.innerHTML = "Score: " + score;
    hiScoreCounter.innerHTML = "Hi Score:" + hiScore;

    svg.addEventListener("click", (event) => {
        if (event.target == svg && state == 0) {
            svg.requestPointerLock();
            startGame();
            svg.removeChild(text);
        }
    })
    
}

class pickUp {
    constructor(){
        /**
         * Moves the power up down the screen
         */
        this.move = function () {
            let y = parseInt(this.base.getAttribute("y")) + 4;
            let x = parseFloat(this.base.getAttribute("x"));
            if (x < 52 || x > gameWidth - 52){
                x = Math.random() * (gameWidth - 52) + 52;
            }
            this.base.setAttribute("x", `${x}`);
            this.base.setAttribute("y", `${y}`);
            this.sprite.setAttribute("transform", `translate(${x}, ${y})`);
            this.y = y;

            let stroke = this.textbase.getAttribute("stroke");
            this.animationTimer++;
            if (this.animationTimer % 5 == 0) {
                if (stroke == "cyan") {
                    stroke = "white";
                } else {
                    stroke = "cyan";
                }
                this.textbase.setAttribute("stroke", stroke);
            }
        }
    }
}

/**
 * Triple Shot powerup
 */

class TripleShot extends pickUp {
    constructor(originX) {
        super();
        this.originX = originX;
        this.sprite = document.createElementNS(svgNS, "g");
        this.sprite.setAttribute("width", "32");
        this.sprite.setAttribute("height", "32");
        this.base = document.createElementNS(svgNS, "rect");
        this.base.setAttribute("width", "32");
        this.base.setAttribute("height", "32");
        this.base.setAttribute("x", this.originX);
        this.base.setAttribute("y", "8");
        this.base.setAttribute("fill", "transparent");

        this.textbase = document.createElementNS(svgNS, "circle");
        this.textbase.setAttribute("r", "16");
        this.textbase.setAttribute("cx", "16");
        this.textbase.setAttribute("cy", "16");
        this.textbase.setAttribute("fill", "blue");
        this.textbase.setAttribute("stroke", "cyan");
        this.textbase.setAttribute("stroke-width", "4");
        this.textbase.style.userSelect = "none";

        let tripleText = document.createElementNS(svgNS, "text");
        tripleText.setAttribute("x", "16");
        tripleText.setAttribute("y", "20");
        tripleText.setAttribute("text-anchor", "middle");
        tripleText.setAttribute("alignment-baseline", "middle");
        tripleText.setAttribute("fill", "#fff");
        tripleText.setAttribute("font-size", "20px");
        tripleText.setAttribute("font-family", "VT323");
        tripleText.textContent = "x3";

        this.animationTimer = 0;

        this.sprite.appendChild(this.textbase);
        this.sprite.appendChild(tripleText);

        /**
         * Method to check for collisions with player
         */
        this.checkCollision = function () {

            if (isCollide(this.base, playerSpriteBase)) {
                svg.removeChild(this.sprite);
                svg.removeChild(this.base);
                tripShot = 600;
                let powerUpSFX = new Audio("assets/powerUp.wav");
                powerUpSFX.volume = 0.5;
                powerUpSFX.play();
                powerUps.splice(powerUps.indexOf(this), 1);


            }

        }
    }
}



class Shield  extends pickUp {
    constructor(originX) {
        super();
        this.originX = originX;
        this.sprite = document.createElementNS(svgNS, "g");
        this.sprite.setAttribute("width", "32");
        this.sprite.setAttribute("height", "32");
        this.base = document.createElementNS(svgNS, "rect");
        this.base.setAttribute("width", "32");
        this.base.setAttribute("height", "32");
        this.base.setAttribute("x", this.originX);
        this.base.setAttribute("y", "8");
        this.base.setAttribute("fill", "transparent");

        this.textbase = document.createElementNS(svgNS, "circle");
        this.textbase.setAttribute("r", "16");
        this.textbase.setAttribute("cx", "16");
        this.textbase.setAttribute("cy", "16");
        this.textbase.setAttribute("fill", "blue");
        this.textbase.setAttribute("stroke", "cyan");
        this.textbase.setAttribute("stroke-width", "4");
        this.textbase.style.userSelect = "none";

        let shieldText = document.createElementNS(svgNS, "text");
        shieldText.setAttribute("x", "16");
        shieldText.setAttribute("y", "20");
        shieldText.setAttribute("text-anchor", "middle");
        shieldText.setAttribute("alignment-baseline", "middle");
        shieldText.setAttribute("fill", "#fff");
        shieldText.setAttribute("font-size", "20px");
        shieldText.setAttribute("font-family", "VT323");
        shieldText.textContent = "O";

        this.animationTimer = 0;

        this.sprite.appendChild(this.textbase);
        this.sprite.appendChild(shieldText);

        /**
         * Method to check for collisions with player
         */
        this.checkCollision = function () {

            if (isCollide(this.base, playerSpriteBase)) {
                svg.removeChild(this.sprite);
                svg.removeChild(this.base);
                shield = 400;
                playerShield.setAttribute("stroke", "cyan");
                let powerUpSFX = new Audio("assets/powerUp.wav");
                powerUpSFX.volume = 0.5;
                powerUpSFX.play();
                powerUps.splice(powerUps.indexOf(this), 1);


            }

        }

    }
}

/**
 * Power up, increases rate of fire
 */
class fireUp  extends pickUp {
    constructor(originX) {
        super();
        this.originX = originX;
        this.sprite = document.createElementNS(svgNS, "g");
        this.sprite.setAttribute("width", "32");
        this.sprite.setAttribute("height", "32");
        this.base = document.createElementNS(svgNS, "rect");
        this.base.setAttribute("width", "32");
        this.base.setAttribute("height", "32");
        this.base.setAttribute("x", this.originX);
        this.base.setAttribute("y", "8");
        this.base.setAttribute("fill", "transparent");

        this.textbase = document.createElementNS(svgNS, "circle");
        this.textbase.setAttribute("r", "16");
        this.textbase.setAttribute("cx", "16");
        this.textbase.setAttribute("cy", "16");
        this.textbase.setAttribute("fill", "blue");
        this.textbase.setAttribute("stroke", "cyan");
        this.textbase.setAttribute("stroke-width", "4");
        this.textbase.style.userSelect = "none";

        let fireUpText = document.createElementNS(svgNS, "text");
        fireUpText.setAttribute("x", "16");
        fireUpText.setAttribute("y", "22");
        fireUpText.setAttribute("text-anchor", "middle");
        fireUpText.setAttribute("alignment-baseline", "middle");
        fireUpText.setAttribute("fill", "#fff");
        fireUpText.setAttribute("font-size", "20px");
        fireUpText.setAttribute("font-family", "VT323");
        fireUpText.textContent = "^";

        this.sprite.appendChild(this.textbase);
        this.sprite.appendChild(fireUpText);

        this.animationTimer = 0;

        /**
         * Method to check collision with the player
         */
        this.checkCollision = function () {

            if (isCollide(this.base, playerSpriteBase)) {
                svg.removeChild(this.sprite);
                svg.removeChild(this.base);
                if (shotTimer > 300){
                shotTimer -= 30;
                }
                else{
                    score += 10;
                }
                let powerUpSFX = new Audio("assets/powerUp.wav");
                powerUpSFX.volume = 0.5;
                powerUpSFX.play();
                powerUps.splice(powerUps.indexOf(this), 1);


            }

        }
    }
}

/**
 * Enemy bullet object
 */

class EnemyBullet {
    constructor(originX, originY, xDir) {
        this.sprite = document.createElementNS(svgNS, "rect");
        this.sprite.setAttribute("x", originX.toString());
        this.sprite.setAttribute("y", originY.toString());
        this.sprite.setAttribute("width", "8");
        this.sprite.setAttribute("height", "32");
        this.sprite.setAttribute("fill", "red");
        this.xDir = xDir;
        this.animationTimer = 0;

        /**
         * Method to check collisions
         */
        this.checkCollision = function () {

            if (isCollide(this.sprite, playerSpriteBase)) {
                svg.removeChild(this.sprite);
                enemyBullets.splice(enemyBullets.indexOf(this), 1);

                if (!shield) {
                    generateExplosion(playerSpriteBase.getAttribute("x"), playerSpriteBase.getAttribute("y"));
                    gameOver();
                }
            }

        }
        /**
         * Moves the bullet down the screen
         */
        this.move = function () {
            let y = parseInt(this.sprite.getAttribute("y")) + 16;
            this.sprite.setAttribute("y", `${y}`);
            let x = parseInt(this.sprite.getAttribute("x")) + 4 * this.xDir;
            this.sprite.setAttribute("x", `${x}`)
            let fill = this.sprite.getAttribute("fill");
            this.animationTimer++;
            if (this.animationTimer % 5 == 0) {
                if (fill == "red") {
                    fill = "pink";
                } else {
                    fill = "red";
                }
                this.sprite.setAttribute("fill", fill);
            }
        }
    }

}

class Bullet {
    constructor(originX, originY, xDir) {
        this.sprite = document.createElementNS(svgNS, "rect");
        this.sprite.setAttribute("x", originX.toString());
        this.sprite.setAttribute("y", originY.toString());
        this.sprite.setAttribute("width", "8");
        this.sprite.setAttribute("height", "32");
        this.sprite.setAttribute("fill", "cyan");
        this.xDir = xDir;
        this.animationTimer = 0;

        // Method to check collisions with enemies
        this.checkCollision = function () {
            scrn = svg.getBoundingClientRect();
            gameWidth = scrn.width - 40;
            gameHeight = scrn.height - 40;
            for (let enemy = 0; enemy < enemies.length; enemy++) {
                if (isCollide(this.sprite, enemies[enemy].base)) {
                    svg.removeChild(this.sprite);
                    bullets.splice(bullets.indexOf(this), 1);
                    score += 10;
                    generateExplosion(enemies[enemy].base.getAttribute("x"), enemies[enemy].base.getAttribute("y"));
                    svg.removeChild(enemies[enemy].base);
                    svg.removeChild(enemies[enemy].sprite);
                    if (score % tripleThreshold == 0) {
                        let randomX = Math.floor(Math.random() * (gameWidth - 60)) + 60;
                        let thispowerUp = new TripleShot(randomX);
                        tripleThreshold += 200;
                        svg.appendChild(thispowerUp.base);
                        svg.appendChild(thispowerUp.sprite);
                        powerUps.push(thispowerUp);

                    }
                    if (score % fireThreshold == 0) {
                        let randomX = Math.floor(Math.random() * (gameWidth - 60)) + 60;
                        let randomType = Math.floor(Math.random() * 4) + 1;
                        let thispowerUp;
                        if (randomType > 1) {
                            thispowerUp = new fireUp(randomX);
                        } else {
                            thispowerUp = new Shield(randomX);
                        }
                        fireThreshold += 70;
                        svg.appendChild(thispowerUp.base);
                        svg.appendChild(thispowerUp.sprite);
                        powerUps.push(thispowerUp);

                    }
                    enemies.splice(enemy, 1);
                    break;
                }
            }
        }

        /**
         * Moves the bullet up the screen
         */
        this.move = function () {
            let y = parseInt(this.sprite.getAttribute("y")) - 8;
            this.sprite.setAttribute("y", `${y}`);
            let x = parseInt(this.sprite.getAttribute("x")) + 4 * this.xDir;
            this.sprite.setAttribute("x", `${x}`)
            let fill = this.sprite.getAttribute("fill");
            this.animationTimer++;
            if (this.animationTimer % 5 == 0) {
                if (fill == "cyan") {
                    fill = "blue";
                } else {
                    fill = "cyan";
                }
                this.sprite.setAttribute("fill", fill);
            }
        }
    }
}

/**
 * Parent enemy class
 */
class Enemy {
    constructor() {
        this.checkCollision = function () {
            if (isCollide(playerSpriteBase, this.base)) {
                if (!shield) {
                    generateExplosion(playerSpriteBase.getAttribute("x"), playerSpriteBase.getAttribute("y"));
                    gameOver();
                }
                else{svg.removeChild(this.base);
                    svg.removeChild(this.sprite);
                    }
                generateExplosion(this.base.getAttribute("x"), this.base.getAttribute("y"));
                enemies.splice(enemies.indexOf(this), 1);
                return true;
            }
        }

        /**
         * Enables enemy shooting
         */
        this.shoot = function () {
            this.shotTimer++;
            if (this.shotTimer == 50) {
                this.shotTimer -= 100;
                let x = parseFloat(this.base.getAttribute("x"));
                let y = parseFloat(this.base.getAttribute("y"));
                let bullet = new EnemyBullet(x + 25, y + 30, 0);
                enemyBullets.push(bullet);
                svg.appendChild(bullet.sprite);
            }
        }
    }
}

/**
 * An orb-like enemy that bounces across the screen
 */

class Enemy1 extends Enemy {
    constructor(randomX) {
        super();
        this.base = document.createElementNS(svgNS, "rect");
        this.sprite = document.createElementNS(svgNS, "g");
        this.base.setAttribute("width", "60");
        this.base.setAttribute("height", "60");
        this.base.setAttribute("x", randomX.toString());
        this.base.setAttribute("y", "-60");
        this.base.setAttribute("fill", "transparent");
        this.shotTimer = 0;

        let enemyDisc = document.createElementNS(svgNS, "circle");
        enemyDisc.setAttribute("fill", "url(#shell-gradient)");
        enemyDisc.setAttribute("cx", "30");
        enemyDisc.setAttribute("cy", "30");
        enemyDisc.setAttribute("r", "30");

        let enemyCockpit = document.createElementNS(svgNS, "circle");
        enemyCockpit.setAttribute("fill", "url(#red-gradient)");
        enemyCockpit.setAttribute("cx", "30");
        enemyCockpit.setAttribute("cy", "40");
        enemyCockpit.setAttribute("r", "12");
        enemyCockpit.setAttribute("stroke", "#333");
        enemyCockpit.setAttribute("stroke-width", "4");

        let x = parseFloat(this.base.getAttribute("x"));
        let y = parseFloat(this.base.getAttribute("y"));
        this.sprite.setAttribute("transform", `translate(${x}, ${y})`);


        this.sprite.appendChild(enemyDisc);
        this.sprite.appendChild(enemyCockpit);
        this.y = y;
        this.xDir = -1;

        /**
         * Handles enemy movement
         */
        this.move = function () {
            let y = parseInt(this.base.getAttribute("y")) + 4;
            let x = parseFloat(this.base.getAttribute("x")) + 4 * this.xDir;
            this.base.setAttribute("y", `${y}`);
            this.base.setAttribute("x", `${x}`);
            this.sprite.setAttribute("transform", `translate(${x}, ${y})`);
            this.y = y;

            if (x + this.xDir * 10 > gameWidth || x + this.xDir * 10 < 0) {
                this.xDir *= -1;
            }
        }

    }
};

/**
 * A triangular enemy that flies in a straight line
 */
class Enemy2 extends Enemy {
    constructor(randomX) {
        super();
        this.base = document.createElementNS(svgNS, "rect");
        this.sprite = document.createElementNS(svgNS, "g");
        this.base.setAttribute("width", "60");
        this.base.setAttribute("height", "60");
        this.base.setAttribute("x", randomX.toString());
        this.base.setAttribute("y", "-60");
        this.base.setAttribute("fill", "transparent");
        this.shotTimer = 0;

        let enemyBody = document.createElementNS(svgNS, "polygon");
        enemyBody.setAttribute("points", "0,0 30,60  60,0 30,10");
        enemyBody.setAttribute("fill", "url(#body-gradient)");

        let enemyCockpit = document.createElementNS(svgNS, "ellipse");
        enemyCockpit.setAttribute("fill", "url(#red-gradient)");
        enemyCockpit.setAttribute("cx", "30");
        enemyCockpit.setAttribute("cy", "30");
        enemyCockpit.setAttribute("ry", "8");
        enemyCockpit.setAttribute("rx", "6");
        enemyCockpit.setAttribute("stroke", "#333");
        enemyCockpit.setAttribute("stroke-width", "2");

        let x = parseFloat(this.base.getAttribute("x"));
        let y = parseFloat(this.base.getAttribute("y"));
        this.sprite.setAttribute("transform", `translate(${x}, ${y})`);

        this.sprite.appendChild(enemyBody);
        this.sprite.appendChild(enemyCockpit);
        this.y = y;

        /**
         * Handles enemy movement
         */
        this.move = function () {
            let y = parseInt(this.base.getAttribute("y")) + 4;
            let x = parseFloat(this.base.getAttribute("x"));
            this.base.setAttribute("y", `${y}`);
            this.sprite.setAttribute("transform", `translate(${x}, ${y})`);
            this.y = y;
        }
    }
}

/**
 * An orb-like enemy that bounces across the screen
 */

class Enemy3 extends Enemy {
    constructor(randomX) {
        super();
        this.base = document.createElementNS(svgNS, "rect");
        this.sprite = document.createElementNS(svgNS, "g");
        this.base.setAttribute("width", "40");
        this.base.setAttribute("height", "130");
        this.base.setAttribute("x", randomX.toString());
        this.base.setAttribute("y", "-100");
        this.base.setAttribute("fill", "transparent");
        this.shotTimer = 0;
        this.animationTimer = 0;

        this.enemyBack = document.createElementNS(svgNS, "ellipse");
        this.enemyBack.setAttribute("fill", "url(#shell-gradient)");
        this.enemyBack.setAttribute("cx", "20");
        this.enemyBack.setAttribute("cy", "14");
        this.enemyBack.setAttribute("rx", "14");
        this.enemyBack.setAttribute("ry", "14");

        this.enemyTube = document.createElementNS(svgNS, "ellipse");
        this.enemyTube.setAttribute("cx", "20");
        this.enemyTube.setAttribute("cy", "80");
        this.enemyTube.setAttribute("rx", "18");
        this.enemyTube.setAttribute("ry", "18");
        this.enemyTube.setAttribute("fill", "url(#shell-gradient)");

        this.enemyTube2 = document.createElementNS(svgNS, "ellipse");
        this.enemyTube2.setAttribute("cx", "20");
        this.enemyTube2.setAttribute("cy", "44");
        this.enemyTube2.setAttribute("rx", "16");
        this.enemyTube2.setAttribute("ry", "16");
        this.enemyTube2.setAttribute("fill", "url(#shell-gradient)");

        let enemyFront = document.createElementNS(svgNS, "ellipse");
        enemyFront.setAttribute("fill", "url(#shell-gradient)");
        enemyFront.setAttribute("cx", "20");
        enemyFront.setAttribute("cy", "120");
        enemyFront.setAttribute("rx", "20");
        enemyFront.setAttribute("ry", "20");

        let enemyCockpit = document.createElementNS(svgNS, "circle");
        enemyCockpit.setAttribute("fill", "url(#red-gradient)");
        enemyCockpit.setAttribute("cx", "20");
        enemyCockpit.setAttribute("cy", "130");
        enemyCockpit.setAttribute("r", "10");
        enemyCockpit.setAttribute("stroke", "#333");
        enemyCockpit.setAttribute("stroke-width", "4");

        let x = parseFloat(this.base.getAttribute("x"));
        let y = parseFloat(this.base.getAttribute("y"));
        this.sprite.setAttribute("transform", `translate(${x}, ${y})`);


        this.sprite.appendChild(this.enemyBack);
        this.sprite.appendChild(this.enemyTube2);
        this.sprite.appendChild(this.enemyTube);
        this.sprite.appendChild(enemyFront);
        this.sprite.appendChild(enemyCockpit);
        this.y = y;
        this.offset = 1;

        /**
         * Enables enemy shooting
         */
        this.shoot = function () {
            this.shotTimer++;
            if (this.shotTimer == 30) {
                this.shotTimer -= 60;
                let x = parseFloat(this.base.getAttribute("x"));
                let y = parseFloat(this.base.getAttribute("y"));
                let bullet = new EnemyBullet(x + 15, y + 120, 0);
                enemyBullets.push(bullet);
                svg.appendChild(bullet.sprite);
            }
        }

        /**
         * Handles enemy movement
         */
        this.move = function () {
            let y = parseInt(this.base.getAttribute("y")) + 4;
            let x = parseFloat(this.base.getAttribute("x"));
            this.base.setAttribute("y", `${y}`);
            this.base.setAttribute("x", `${x + 1 * this.offset}`);
            this.sprite.setAttribute("transform", `translate(${x}, ${y})`);
            this.y = y;

            this.animationTimer++;

            if (this.animationTimer % 30 == 0) {
                this.offset *= -1;

                this.enemyBack.setAttribute("cx", 20 - (10 * this.offset));
                this.enemyTube2.setAttribute("cx", 20 + (5 * this.offset));
                this.enemyTube.setAttribute("cx", 20 - (5 * this.offset));

            }
        }

    }
};

/**
 * Checks for collisions between two objects
 * @param {*} a The first object
 * @param {*} b The second object
 * @returns If there's a collision
 */
function isCollide(a, b) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

/**
 * Runs player animation
 */
setInterval(function () {
    animatePlayer()
}, 60);

function randomSpawn(){
    return (Math.random() * (gameWidth - 60)) + 60;
}


/**
 * Spawns enemies
 */
setInterval(function () {
    if (enemies.length < 10 && state == 1) {
        let randomX = Math.floor(Math.random() * (gameWidth - 80));
        let Type = waves[currentWave][waveIndex];
        
        if (waveIndex < waves[currentWave].length -1){
            waveIndex ++;
        }
        else{
            currentWave = (Math.floor(Math.random() * (waves.length-1)));
            waveIndex = 0;
        }
    
        console.log("type:" + Type);
        console.log("wave:" + currentWave);
        console.log(waves[currentWave].length)
        let enemy;
        if (Type == 1) {
            enemy = new Enemy1(randomX);
        } else if (Type == 2) {
            enemy = new Enemy2(randomX);
        } else {
            enemy = new Enemy3(randomX);
        }
        svg.appendChild(enemy.base);
        svg.appendChild(enemy.sprite);
        enemies.push(enemy);
        
    }
    

    
    
}, 800)

/**
 * Handles player movement
 */
document.addEventListener("mousemove", (event) => {


    const movementX = event.movementX;
    const svgX = svg.getBoundingClientRect().x;
    const playerWidth = parseInt(playerSpriteBase.getAttribute("width"));
    let newX = parseInt(playerSpriteBase.getAttribute("x")) + movementX;

    if (newX > 0 && newX < parseInt(gameWidth) - (playerWidth + 20)) {
        playerSpriteBase.setAttribute("x", newX);
        playerSprite.setAttribute("transform",`translate(${newX -16}, ${gameHeight - 120})`);
    } else if (newX < 36) {
        playerSpriteBase.setAttribute("x", 36);
        playerSprite.setAttribute("transform", `translate(${0}, ${gameHeight - 120})`);
    } else if (newX > gameWidth) {
        playerSpriteBase.setAttribute("x", gameWidth - (playerWidth + 16));
        playerSprite.setAttribute("transform", `translate(${gameWidth - (playerWidth + 30)}, ${gameHeight - 120})`);
    }
});


document.addEventListener("mousedown", function(){
    firing = true;
})

document.addEventListener("mouseup", function(){
    firing = false;
})
/**
 * Allows player to fire lasers
 */
setInterval( function() {
    if (canShoot && state == 1) {
        if (firing){
        if (!tripShot) {
            let originX = parseInt(playerSpriteBase.getAttribute("x")) + 20;
            let originY = playerSpriteBase.getAttribute("y") - 16;
            let bullet = new Bullet(originX, originY, 0);
            svg.appendChild(bullet.sprite);
            bullets.push(bullet);
        }

        if (tripShot) {
            let originX = parseInt(playerSpriteBase.getAttribute("x")) + 26;
            let originY = playerSpriteBase.getAttribute("y") - 16;
            let bullet1 = new Bullet(originX, originY, 0);
            let bullet2 = new Bullet(originX, originY, 1);
            let bullet3 = new Bullet(originX, originY, -1);
            svg.appendChild(bullet1.sprite);
            svg.appendChild(bullet2.sprite);
            svg.appendChild(bullet3.sprite);
            bullets.push(bullet1, bullet2, bullet3);
        }
        let laserSFX = new Audio('assets/laserSFX.wav');
        laserSFX.volume = 0.3;
        laserSFX.play();
        canShoot = false;
        setTimeout(function () {
            canShoot = true;
        }, shotTimer)
    }
    }
}, 16.67)

/**
 * Main game loop
 */
setInterval(function () {
    if (state == 1) {
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i]){
            enemies[i].move();
            enemies[i].shoot();
            if (enemies[i].checkCollision()){
                i--;
            }
            if (enemies[i] && enemies[i].y > gameHeight){
                enemies.splice(i, 1);
                i--;
            }
        }
        }
        for (let bullet = 0; bullet < bullets.length; bullet++) {
            bullets[bullet].move();
            bullets[bullet].checkCollision();

            if (bullets[bullet]) {
                if (bullets[bullet].y < 0) {
                    svg.removeChild(bullets[bullet].sprite);
                    bullets.splice(bullet, 1);
                }
            }

        }

        for (let bullet = 0; bullet < enemyBullets.length; bullet++) {

            enemyBullets[bullet].move();
            enemyBullets[bullet].checkCollision();

            if (enemyBullets[bullet]) {
                if (enemyBullets[bullet].y > gameHeight) {
                    svg.removeChild(enemyBullets[bullet].sprite);
                    enemyBullets.splice(bullet, 1);
                    bullet--;
                }

            }
        }
        scoreCounter.innerHTML = "Score: " + score;
        hiScoreCounter.innerHTML = "Hi Score:" + hiScore;
    }

    for (let powerUp = 0; powerUp < powerUps.length; powerUp++) {
        if (powerUps[powerUp]) {
            powerUps[powerUp].move();
            powerUps[powerUp].checkCollision(powerUp);
        }
    }

    for (let star = 0; star < stars.length; star++) {
        let y = parseInt(stars[star].getAttribute("cy")) + starSpeed;
        stars[star].setAttribute("cy", `${y}`);

        if (parseInt(stars[star].getAttribute("cy")) > svg.getAttribute("height")) {
            let randomX = Math.floor(Math.random() * (gameWidth));
            stars[star].setAttribute("cy", "0");
            stars[star].setAttribute("cx", randomX);
        }
    }
    for (let explosion = 0; explosion < explosions.length; explosion++) {
        let currentExplosion = explosions[explosion];
        let radius = currentExplosion.getAttribute("r") * 1.2;
        let fade = currentExplosion.getAttribute("stroke-opacity") - 0.05;
        currentExplosion.setAttribute("r", radius);
        currentExplosion.setAttribute("stroke-opacity", fade);

        if (radius > 60) {
            currentExplosion.setAttribute("stroke", "yellow");
        }

        if ((radius) > 90 || fade < 0) {
            svg.removeChild(currentExplosion);
            explosions.splice(explosion, 1);
            explosion--;
        }
    }
    if (tripShot > 0) {
        tripShot--;
    }
    if (shield > 0) {
        shield--;
    }
    

}, 16.67); // 60 ticks per second

/**
 * Resizes the game screen to enable responsive requirement
 */
window.addEventListener("resize", function () {
    scrn = svg.getBoundingClientRect();
    gameWidth = scrn.width - 40;
    gameHeight = scrn.height - 40;


    playerSpriteBase.setAttribute("y", `${gameHeight-120}`)
})

/**
 * Starts the game
 */
function startGame() {
    svg.style.cursor = "none";
    svg.appendChild(playerSpriteBase);
    svg.appendChild(playerSprite);
    starSpeed = 16;

    state = 2;
    let music = document.getElementById("music");
    if (music.checked) {
        bgm.currentTime = 0;
        bgm.play();
    }
    setTimeout(function () {
        state = 1;
    }, 500)

    currentWave = 0;
    waveIndex = 0;
}

/**
 * Ends the game and handles cleanup
 */
function gameOver() {
    bgm.pause();
    text.textContent = "Game Over";
    hiScore = Math.max(score, hiScore);
    score = 0;
    svg.appendChild(text);
    state = 3;
    tripShot = 0;
    tripleThreshold = 100;
    fireThreshold = 50;
    shotTimer = 600;

    svg.removeChild(playerSprite);
    svg.removeChild(playerSpriteBase);
    starSpeed = 2;
    for (let enemy = 0; enemy < enemies.length; enemy++) {
        svg.removeChild(enemies[enemy].base);
        svg.removeChild(enemies[enemy].sprite);
        enemies.splice(enemy, 1);
        enemy--;
    }
    for (let bullet = 0; bullet < bullets.length; bullet++) {
        svg.removeChild(bullets[bullet].sprite);
        bullets.splice(bullet, 1);
        bullet--;
    }
    for (let bullet = 0; bullet < enemyBullets.length; bullet++) {
        svg.removeChild(enemyBullets[bullet].sprite);
        enemyBullets.splice(bullet, 1);
        bullet--;
    }
    for (let powerUp = 0; powerUp < powerUps.length; powerUp++) {
        if (powerUps[powerUp]) {
            svg.removeChild(powerUps[powerUp].base);
            svg.removeChild(powerUps[powerUp].sprite);
            powerUps.splice(powerUp, 1);
            powerUp--;
        }
    }

    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerUps = [];
    setTimeout(function () {
        state = 0;
        text.textContent = "Click to Start Game";
        svg.style.cursor = "pointer";
    }, 500);

}
