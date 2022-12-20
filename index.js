// Consts
const inputsPlayer = document.querySelectorAll('header [data-param]');
const inputsEnemy = document.querySelectorAll('footer [data-param]');

//
const levelupScreen = document.querySelector('[data-levelup="screen"]');
levelupScreen.querySelectorAll("button").forEach((val, ind, arr) => {
    val.addEventListener("click", event => {
        switch(true) {
            case ind === 0:
                playerActor.maxHealth += 5;
                break;
            case ind === 1:
                playerActor.attack += 1;
                break;
            case ind === 2:
                playerActor.defence += 1;
                break;
            case ind === 3:
                playerActor.agility += 1;
                break;
            case ind === 4:
                playerActor.favor += 1;
                break;
            default:
                throw Error("Invalid index, check code for oversights");
        }
        playerActor.curHealth = playerActor.maxHealth;
        levelView(0);
    });
});
// Runs or pauses the combat
let pause = false;

// Class template for player/enemy character
class Actor {
    constructor(level, health, attack, defence, agility, favor) {
        this.level = level;
        this.curExp = 0;
        this.maxHealth = health;
        this.curHealth = health;
        this.attack = attack;
        this.defence = defence;
        this.agility = agility;
        this.favor = favor;
    }
}
// Shows or hides the levelup screen
function levelView(bool) {
    if(bool) {
        pause = true;
        levelupScreen.classList.add("js-flex");
    } else if (!bool) {
        pause = false;
        levelupScreen.classList.remove("js-flex");
    }
}

// Checks if level-up is possible
function levelCheck() {
    playerActor.curExp++;
    if(playerActor.curExp >= Math.floor(Math.sqrt(playerActor.level))) {
        playerActor.curExp = 0;
        playerActor.level++;
        levelView(1);
    }
    enemyActor = generateEnemy();
}
// Returns a random number, minimum of "min" and maximum of "max - 1"
function randomNumber(min, max) {
    return Math.floor(Math.random() * max + min);
}
// Creates an array with randomly generated attributes
function attributeGenerator(level) {
    // Maxpoints minus the minimum amount of points (5 HP, 1 other)
    let maxPoints = 10 + (level - 1);
    let attributes = [];
    let classType = randomNumber(0, 3);
    // Assign a default amount of points, preventing ridiculous cases (e.g.: max ATK and AGI to deal a single powerful hit)
    switch(true) {
        case classType === 0:
            attributes = [maxPoints * .1, maxPoints * .3, maxPoints * .1, maxPoints * .3, 0];
            break;
        case classType === 1:
            attributes = [maxPoints * .3, maxPoints * .1, maxPoints * .3, maxPoints * .1, 0];            
            break;
        case classType === 2:
            attributes = [maxPoints * .2, maxPoints * .2, maxPoints * .2, maxPoints * .2, 0];
            break;
        default:
            throw Error("Invalid variable classType, check the code");
    }
    attributes.forEach((v, i, a) => {
        a[i] = parseInt(v);
        maxPoints -= a[i];
    });
    // Now, randomly assign the 20% leftover points
    while(maxPoints > 0) {
        attributes[randomNumber(0, 5)]++;
        maxPoints--;
    }
    // Each point in health raises it by 5 Points
    attributes[0] *= 5;
    // Returns the attribute array
    return attributes;
}

// Generates a randomly generated enemy, based on the player's current Level
function generateEnemy() {
    let attArr = attributeGenerator(playerActor.level);
    return new Actor(playerActor.level, attArr[0], attArr[1], attArr[2], attArr[3], attArr[4]);
}
// Creates the starting player and enemy
let playerActor = new Actor(1, 25, 5, 5, 5, 0);
let enemyActor = generateEnemy();

/* Combat related */

// Turn order
let turnOrder;
if(playerActor.agility > enemyActor.agility) {
    turnOrder = 0;
} else if(enemyActor.agility > playerActor.agility) {
    turnOrder = 1;
} else if(randomNumber(0, 2)) {
    turnOrder = 0;
} else {
    turnOrder = 1;
}
// Damage
function causeDamage(turn, isCrit) {
    let baseDamage;
    if(turnOrder === 0) {
        baseDamage = playerActor.attack - enemyActor.defence;
        if(baseDamage <= 0) {
            baseDamage = 1;
        }
        if(isCrit) {
            baseDamage *= 2;
        }
    } else {
        baseDamage = enemyActor.attack - playerActor.defence;
        if(baseDamage <= 0) {
            baseDamage = 1;
        }
        if(isCrit) {
            baseDamage *= 2;
        }
    }
    return baseDamage;
}
// Result of combat
function combatResult() {
    if(playerActor.curHealth <= 0) {
        alert("Jogador derrotado...");
        pause = true;
    } else if(enemyActor.curHealth <= 0) {
        console.log("inimigo derrotado!");
        levelCheck();
    }
}
// Combat Function
function combat() {
    if(turnOrder === 0) {
        if(randomNumber(1, 100) <= playerActor.favor) {
            console.log("Player Critical Hit!");
            enemyActor.curHealth -= causeDamage(turnOrder, 1);
        } else {
            enemyActor.curHealth -= causeDamage(turnOrder, 0);;
        }
        turnOrder = 1;
    } else {
        if(randomNumber(1, 100) <= enemyActor.favor) {
            console.log("Enemy Critical Hit!");
            playerActor.curHealth -= causeDamage(turnOrder, 1);
        } else {
            playerActor.curHealth -= causeDamage(turnOrder, 0);
        }
        turnOrder = 0;
    }
    combatResult();
}
// Update player and enemy attributes (e.g.: HP)
function updateScreen() {
    // Updates PC
    inputsPlayer[0].value = playerActor.level;
    inputsPlayer[1].value = `${playerActor.curHealth}/${playerActor.maxHealth}`;
    inputsPlayer[2].value = playerActor.attack;
    inputsPlayer[3].value = playerActor.defence;
    inputsPlayer[4].value = playerActor.agility;
    inputsPlayer[5].value = playerActor.favor;
    // Updates NPC
    inputsEnemy[0].value = enemyActor.level;
    inputsEnemy[1].value = `${enemyActor.curHealth}/${enemyActor.maxHealth}`;
    inputsEnemy[2].value = enemyActor.attack;
    inputsEnemy[3].value = enemyActor.defence;
    inputsEnemy[4].value = enemyActor.agility;
    inputsEnemy[5].value = enemyActor.favor;
}
// Runs everything periodically
function executeTurn() {
    // runs only if game isn't paused
    if(!pause) {
    combat();
    // updates screen after everything
    updateScreen();
    }
}

executeTurn();
setInterval(executeTurn, 1);