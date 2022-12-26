/* Easy way to disable the entire JavaScript file, for HTML/CSS changes */

//throw Error("JavaScript disabled temporarily for debugging purposes.");

/* Consts */
// Main Screen
const inputsPlayer = document.querySelectorAll('header [data-attribute], .main__attributes:first-child [data-attribute]');
const inputsEnemy = document.querySelectorAll('footer [data-attribute], .main__attributes:last-child [data-attribute]');
// Levelup Screen
const levelupScreen = document.querySelector('[data-levelup="screen"]');
const levelupInputs = document.querySelectorAll('[data-levelup="input"]');
const levelupBtnDecrease = document.querySelectorAll('[data-levelup="btn-minus"]');
const levelupBtnIncrease = document.querySelectorAll('[data-levelup="btn-plus"]');
const levelupBtnConfirm = document.querySelector('[data-levelup="confirm"');

/* List:
    0 = Combat;
    1 = Level-Up;
*/
var currentScreen = 0;

function levelupModifyAttribute(attribute, action) {
    // Defines if attribute should be raised or lowered
    let values = [];
    if(!action) {
        values = [5, 1];
    } else {
        values = [-5, -1];
    }
    // Statements
    switch(true) {
        case attribute === 0:
            playerActor.maxHealth += values[0];
            break;
        case attribute === 1:
            playerActor.attack += values[1];
            break;
        case attribute === 2:
            playerActor.defence += values[1];
            break;
        case attribute === 3:
            playerActor.agility += values[1];
            break;
        case attribute === 4:
            playerActor.favor += values[1];
            break;
        default:
            throw Error("Verify function levelupChanges()");
    }
}

/* Level-up query selectors */
// Decrease assigned points
levelupBtnDecrease.forEach((val, ind, arr) => {
    val.addEventListener("click", event => {
        if(playerActor.curSpread[ind] > 0) {
            playerActor.curPoints++;
            playerActor.curSpread[ind] -= 1;
            levelupModifyAttribute(ind, 1);
            updateScreen();
        }
    });
})
// Assign points to attributes
levelupBtnIncrease.forEach((val, ind, arr) => {
    val.addEventListener("click", event => {
        if(playerActor.curPoints > 0) {
            playerActor.curPoints--;
            playerActor.curSpread[ind] += 1;
            levelupModifyAttribute(ind, 0);
            updateScreen();
        }
    });
});
// Confirm selection
levelupBtnConfirm.addEventListener("click", event => {
    if(playerActor.curPoints === 0) {
        playerActor.curHealth = playerActor.maxHealth;
        levelView(0);
    }
});

// Runs or pauses the combat
let pause = false;

// Class template for player/enemy character
class Actor {
    constructor(level, health, attack, defence, agility, favor) {
        this.level = level;
        this.curExp = 0;
        this.maxPoints = Math.floor(Math.cbrt(this.level));
        this.curPoints = this.maxPoints;
        this.curSpread = [0, 0, 0, 0, 0];
        this.maxHealth = health;
        this.curHealth = health;
        this.attack = attack;
        this.defence = defence;
        this.agility = agility;
        this.curHits = 0;
        this.favor = favor;
        this.curFavor = 0;
    }
}
// Shows or hides the levelup screen
function levelView(bool) {
    if(bool) {
        pause = true;
        levelupScreen.classList.add("js-flex");
        currentScreen = 1;
    } else if (!bool) {
        pause = false;
        levelupScreen.classList.remove("js-flex");
        currentScreen = 0;
    }
}

// Checks if level-up is possible
function levelCheck() {
    playerActor.curExp++;
    if(playerActor.curExp >= Math.floor(Math.cbrt(playerActor.level))) {
        playerActor.curExp = 0;
        playerActor.maxPoints = 2;
        // Original formula: Math.floor(Math.cbrt(playerActor.level))
        playerActor.curPoints = playerActor.maxPoints;
        playerActor.curSpread.forEach((val, ind, arr) => {
            arr[ind] = 0;
        });
        playerActor.level++;
        levelView(1);
    }
    enemyActor = generateEnemy();
    getTurnOrder();
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

// Get actor curHits
function getCurrentHits(actor) {
    if(!actor) {
        playerActor.curHits = Math.floor(playerActor.agility / enemyActor.agility);
        if(playerActor.curHits <= 0) {
            playerActor.curHits = 1;
        }
    } else {
        enemyActor.curHits = Math.floor(enemyActor.agility / playerActor.agility);
        if(enemyActor.curHits <= 0) {
            enemyActor.curHits = 1;
        }
    }
}

// Define turn order and curHits
let turnOrder;
function getTurnOrder() {
    if(playerActor.agility > enemyActor.agility) {
        turnOrder = 0;
    } else if(enemyActor.agility > playerActor.agility) {
        turnOrder = 1;
    } else {
        let randomOrder = randomNumber(0, 2);
        if(randomOrder) {
            turnOrder = 0;
        } else {
            turnOrder = 1;
        }
    }
    getCurrentHits(turnOrder);
}
getTurnOrder();

// Damage
function causeDamage(isCrit) {
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
        playerActor.curFavor += playerActor.favor;
        // Check if Player critical hit is possible
        if(playerActor.curFavor >= 100) {
            console.log("PC Crit");
            playerActor.curFavor = 0;
            enemyActor.curHealth -= causeDamage(1);
        } else {
            enemyActor.curHealth -= causeDamage(0);
        }
        // Player attacks "curHits" times
        playerActor.curHits--;
        if(playerActor.curHits <= 0) {
            turnOrder = 1;
            getCurrentHits(turnOrder);
        }
    } else {
        enemyActor.curFavor += enemyActor.favor;
        // Check if Enemy critical hit is possible
        if(enemyActor.curFavor >= 100) {
            console.log("Enemy Critical Hit!");
            enemyActor.curFavor = 0;
            playerActor.curHealth -= causeDamage(1);
        } else {
            playerActor.curHealth -= causeDamage(0);
        }
        // Player attacks "curHits" times
        enemyActor.curHits--;
        if(enemyActor.curHits <= 0) {
            turnOrder = 0;
            getCurrentHits(turnOrder);
        }
    }
    combatResult();
}
// Update player and enemy attributes (e.g.: HP)
function updateScreen() {
    switch(true) {
        case currentScreen === 0:
            // Updates main screen player attributes
            inputsPlayer[0].value = playerActor.level;
            inputsPlayer[1].value = `${playerActor.curHealth}/${playerActor.maxHealth}`;
            inputsPlayer[2].value = `${playerActor.curFavor}/100`;
            inputsPlayer[3].value = playerActor.attack;
            inputsPlayer[4].value = playerActor.defence;
            inputsPlayer[5].value = playerActor.agility;
            // Updates main screen enemy attributes
            inputsEnemy[0].value = enemyActor.attack;
            inputsEnemy[1].value = enemyActor.defence;
            inputsEnemy[2].value = enemyActor.agility;
            inputsEnemy[3].value = enemyActor.level;
            inputsEnemy[4].value = `${enemyActor.curHealth}/${enemyActor.maxHealth}`;
            inputsEnemy[5].value = `${enemyActor.curFavor}/100`;
            break;
        case currentScreen === 1:
            // Updates levelup screen
            document.querySelector('[data-attribute="currentPoints"]').innerText = playerActor.curPoints;
            levelupInputs[0].value = playerActor.maxHealth;
            levelupInputs[1].value = playerActor.attack;
            levelupInputs[2].value = playerActor.defence;
            levelupInputs[3].value = playerActor.agility;
            levelupInputs[4].value = playerActor.favor;
            break;
    }
    
    
}
// Runs everything periodically
function executeTurn() {
    // runs only if game isn't paused
    if(!pause) {
        combat();// updates screen after everything
        updateScreen();
    }
}

/* Hotkeys */
// Space
document.addEventListener("keypress", event => {
    console.log(event.code);
    console.log(currentScreen === 1);
    if(event.code === "Space" && currentScreen === 1) {
        levelupBtnConfirm.click();
    }
})


executeTurn();
/* FPS list
    60 FPS = 16.67ms
*/
setInterval(executeTurn, 1);