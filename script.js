const GameContainer = document.querySelector('#game-container');
const canvas = document.querySelector('#canvas');
const c = canvas.getContext('2d');

canvas.width = 2048;
canvas.height = 768;

function ScaleContainer() { // Scaling window to make canvas and UI fit Window
    const windowScale = window.innerWidth / 2048
    GameContainer.style.scale = windowScale <= 0.8 ? windowScale : 0.8;

    var tempSize = 2048 * 0.8;
    var sizeExtra = window.innerWidth - tempSize
    console.log(tempSize)
    GameContainer.style.marginLeft = sizeExtra > 0 ? sizeExtra / 2 + 'px' : '0px'
    GameContainer.style.height = 768 * windowScale + 170 * windowScale + 'px'
}
window.onresize = ScaleContainer;
ScaleContainer()

const debug = false; // Set to true for debug mode

const canvasBottomOffset = 100;
const gravity = 0.7;
const speed = 5;
const jumpSpeed = 20;
var gameActive = false;

const background = new Sprite({ // Background
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './Assets/Sprites/background.gif',
    scale: 2,
    framesMax: 1
})

const shop = new Sprite({ // Shop
    position: {
        x: 1100,
        y: 150,
    },
    imageSrc: './Assets/Sprites/shop.png',
    scale: 4,
    framesMax: 6
})

const player = new Fighter({ // Player
    name: '1',
    position: {
        x: 0 + 200, // Left of canvas
        y: canvas.height - 300,
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: { // Offset for sprite
        x: 0,
        y: 30
    },

    imageSrc: './Assets/Sprites/player1_cropped.png',
    imageLookup: player1Lookup,
    imageFillerX: 50,
    imageFillerY: 10,
    imageFlip: false,
    framesMax: 10,
    framesMaxY: 14,
    scale: 2,
});

const player2 = new Fighter({ // player2
    name: '2',
    position: {
        x: canvas.width - 200, // Right of canvas
        y: canvas.height - 300,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: { // Offset for sprite
        x: 0,
        y: -10,
    },

    imageSrc: './Assets/Sprites/player2_cropped.png',
    imageLookup: player2Lookup,
    imageFillerX: 20,
    imageFillerY: 20,
    imageFlip: true,
    framesMax: 10,
    framesMaxY: 16,
    scale: 5,
});



const keys = {
    KeyA: {
        isDown: false
    },
    KeyD: {
        isDown: false
    },
    KeyS: {
        isDown: false
    },
    KeyQ: {
        isDown: false
    },

    ArrowLeft: {
        isDown: false
    },
    ArrowRight: {
        isDown: false
    },
    ArrowDown: {
        isDown: false
    },
    ShiftRight: {
        isDown: false
    }
}

var fps = 100;
var interval = 1000 / fps;
var then;

function animate(timestamp) {

    requestAnimationFrame(animate);

    if (then === undefined) {
        then = timestamp;
    }

    const delta = timestamp - then;

    if (delta > interval) {
        then = timestamp - (delta % interval);

        c.clearRect(0, 0, canvas.width, canvas.height);

        // background.update(); // Disabled for now (Background-Image is set for Canvas)
        shop.update();
        player.update();
        player2.update();

        player.velocity.x = 0
        player2.velocity.x = 0


        // Player code
        if (keys.KeyA.isDown && player.lastKey === 'KeyA' && !player.hit) {
            player.velocity.x = -speed;
            player.imageFlip = true;
        } else if (keys.KeyD.isDown && player.lastKey === 'KeyD' && !player.hit) {
            player.velocity.x = speed;
            player.imageFlip = false;
        }
        checkValues(player) // Run, Jump, Wall collision etc.
        // Player Collision detection
        if (rectangularCollision({ rect1: player2, rect2: player }) && player2.isAttacking) {
            player2.isAttacking = false;
            player.health -= player2.attackDamage;
            player.hitAnim = player2.attackDamage * 8; // Not sure what should be a good stun time so its just based on damage taken
            player.hit = true;
            player.updateHealthHTML();
        }


        // player2 code
        if (keys.ArrowLeft.isDown && player2.lastKey === 'ArrowLeft' && !player2.hit) {
            player2.velocity.x = -speed;
            player2.imageFlip = true;
        } else if (keys.ArrowRight.isDown && player2.lastKey === 'ArrowRight' && !player2.hit) {
            player2.velocity.x = speed;
            player2.imageFlip = false;
        }
        checkValues(player2) // Run, Jump, Wall collision etc.
        // player2 Collision detection
        if (rectangularCollision({ rect1: player, rect2: player2 }) && player.isAttacking) {
            player.isAttacking = false;
            player2.health -= player.attackDamage;
            player2.hitAnim = player.attackDamage * 8; // Not sure what should be a good stun time so its just based on damage taken
            player2.hit = true;
            player2.updateHealthHTML();
        }

        // Game winner check
        if ((player.health <= 0 || player2.health <= 0) && gameActive) {
            pickAWinner(player, player2, timerId)
        }

    }
}

animate()

function checkValues(character) {
    // Character Movement
    if (gameActive) { // Ignore if game is over

        character.animationHold = false;

        if (character.velocity.x != 0 && character.velocity.y == 0) {
            character.animationNumber = 1
        }
        else if (character.velocity.y != 0) { // Jump (With a forked static up down scenario)
            if (character.position.y >= canvas.height - character.height - (character.animationEnd - character.animationStart + 1) * 100 &&
                ((character.animationNumber == 2 && character.framesCurrent >= character.animationEnd) || character.animationNumber == 3)) {
                character.animationNumber = 3
            }
            else {
                character.animationNumber = 2
            }
            character.animationHold = true;
        }
        else {
            character.animationNumber = 0;
        }

        if (character.isAttackAnim) { // Check if char is attacking
            if (character.attackNumber == 0) {
                character.animationNumber = 6;
            }
            else if (character.attackNumber == 1) {
                character.animationNumber = 7;
            }
        }
        else if (character.hit) {
            character.animationNumber = 8;
        }

        // Character Wall collision
        if (character.position.x < character.width) {
            character.position.x = character.width;
        } else if (character.position.x + character.width * 2 > canvas.width) {
            character.position.x = canvas.width - character.width * 2;
        }
    }
}

AddSkillsToInfoUI();

var keydownHandler = function (event) {
    switch (event.code) {
        case 'KeyW':
            if (!player.hit) {
                if (player.position.y >= canvas.height - player2.height - canvasBottomOffset) { // canvasBottomOffset is space from bottom
                    player.velocity.y = -jumpSpeed;
                }
            }
            break;
        case 'KeyA':
            keys.KeyA.isDown = true;
            player.lastKey = 'KeyA'
            break;
        case 'KeyD':
            keys.KeyD.isDown = true;
            player.lastKey = 'KeyD'
            break;
        case 'KeyS':
            if (!keys.KeyS.isDown && !player.hit) {
                if (!player.isAttacking && player.globalAttackCooldown <= 0 && player.attackCooldown[0] <= 0) {
                    player.attack(0);
                }
                keys.KeyS.isDown = true;
            }
            break;
        case 'KeyQ':
            if (!keys.KeyQ.isDown && !player.hit) {
                if (!player.isAttacking && player.globalAttackCooldown <= 0 && player.attackCooldown[1] <= 0) {
                    player.attack(1);
                }
                keys.KeyQ.isDown = true;
            }
            break;


        case 'ArrowUp':
            if (!player2.hit) {
                if (player2.position.y >= canvas.height - player2.height - canvasBottomOffset) { // canvasBottomOffset is space from bottom
                    player2.velocity.y = -jumpSpeed;
                }
            }
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.isDown = true;
            player2.lastKey = 'ArrowLeft'
            break;
        case 'ArrowRight':
            keys.ArrowRight.isDown = true;
            player2.lastKey = 'ArrowRight'
            break;
        case 'ArrowDown':
            if (!keys.ArrowDown.isDown && !player2.hit) {
                if (!player2.isAttacking && player2.globalAttackCooldown <= 0 && player2.attackCooldown[0] <= 0) {
                    player2.attack(0);
                }
                keys.ArrowDown.isDown = true;
            }
            break;
        case 'ShiftRight':
            if (!keys.ShiftRight.isDown && !player2.hit) {
                if (!player2.isAttacking && player2.globalAttackCooldown <= 0 && player2.attackCooldown[1] <= 0) {
                    player2.attack(1);
                }
                keys.ShiftRight.isDown = true;
            }
            break;
    }
};

var keyupHandler = function (event) {
    switch (event.code) {
        case 'KeyA':
            keys.KeyA.isDown = false;
            break;
        case 'KeyD':
            keys.KeyD.isDown = false;
            break;
        case 'KeyS':
            keys.KeyS.isDown = false;
            break;
        case 'KeyQ':
            keys.KeyQ.isDown = false;
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.isDown = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.isDown = false;
            break;
        case 'ArrowDown':
            keys.ArrowDown.isDown = false;
            break;
        case 'ShiftRight':
            keys.ShiftRight.isDown = false;
            break;
    }
};

function AddListeners() {
    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keyupHandler)
}
function RemoveListeners() {
    window.removeEventListener('keydown', keydownHandler)
    window.removeEventListener('keyup', keyupHandler)
}