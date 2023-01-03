function rectangularCollision({ rect1, rect2 }) {
    return (
        rect1.attackBox.position.x +
        rect1.attackBox.width >=
        rect2.position.x &&
        rect1.attackBox.position.x <=
        rect2.position.x + rect2.width &&
        rect1.attackBox.position.y + rect1.attackBox.height >=
        rect2.position.y &&
        rect1.attackBox.position.y <=
        rect2.position.y + rect2.height
    )
}

let timer = 100
let timerId

// const displayText = document.querySelector('#FightText')
// const displayTextStyle = document.querySelector('#FightText').style
const displayTimer = document.querySelector('#timer')

function pickAWinner(player1, player2, timerId) {
    clearTimeout(timerId)
    gameActive = false;


    if (player1.health <= 0) {
        player1.animationHold = true;
        player1.animationNumber = 4;

        player2.animationNumber = 5;
    }
    if (player2.health <= 0) {
        player2.animationHold = true;
        player2.animationNumber = 4;

        player1.animationNumber = 5;
    }

    var text = document.querySelector('#FightText')

    var gameover = document.createElement('h4')
    gameover.innerHTML = 'Game Over'

    var gameoverPlayer = document.createElement('h4')

    if (player1.health > player2.health) {
        gameoverPlayer.innerHTML = 'Player 1 WINS!'
    }
    else if (player2.health > player1.health) {
        gameoverPlayer.innerHTML = 'Player 2 WINS!'
    }
    else if (player2.health == player1.health) {
        gameoverPlayer.innerHTML = 'TIE!'
    }

    text.appendChild(gameover)
    text.appendChild(gameoverPlayer)

    RemoveListeners()
}

function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000)
        timer--
        displayTimer.innerHTML = timer
    }

    if (timer === 0 && gameActive) {
        pickAWinner(player, player2, timerId)
    }
}

function startGame() {
    var text = document.querySelector('#FightText')

    var gameStatus = document.createElement('h4')
    gameStatus.innerHTML = 'Ready?'

    text.appendChild(gameStatus)

    setTimeout(() => {
        gameStatus.innerHTML = 'Set!'
    }, 2000);

    setTimeout(() => {
        gameStatus.innerHTML = 'FIGHT!'
    }, 3000);

    setTimeout(() => {
        gameActive = true;
        text.replaceChildren();
        AddListeners()
        decreaseTimer()
    }, 4000);
}

startGame()

function AddSkillsToInfoUI() {
    for (let playerIndex = 1; playerIndex <= 2; playerIndex++) { // Index represents player id (1 or 2)

        const playerInfo = document.querySelector('#player' + playerIndex + 'Skills');

        for (let attackIndex = 0; attackIndex < attackLookup.length; attackIndex++) {

            let skill = document.createElement('div');
            skill.id = 'player' + playerIndex + 'Skill' + attackIndex

            let skillHead = document.createElement('p');
            skillHead.innerHTML = attackLookup[attackIndex].name;

            let skillText = document.createElement('p');
            skillText.innerHTML = 'Cooldown: ';

            let skillTextExtra = document.createElement('span');
            skillTextExtra.innerHTML = '0'
            skillTextExtra.id = 'player' + playerIndex + 'Cool' + attackIndex

            skillText.appendChild(skillTextExtra);

            let skillButton = document.createElement('p');
            skillButton.innerHTML = 'Button: ' + attackLookup[attackIndex].button[playerIndex]

            skill.appendChild(skillHead)
            skill.appendChild(skillText)
            skill.appendChild(skillButton)

            playerInfo.appendChild(skill)

        };

    }
}