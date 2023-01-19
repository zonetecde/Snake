// Génère le tableau
var gameBoard = [];
// 0 = void
// 1 = head
// 3 = apple
// 2 = body

let GAMEBOARD_SIZE = 10;

let bodyParts = [];
let score = 2;

let directionX = 1;
let directionY = 0;

let hasLose = false;

// Initialise une grille de jeu vide
for (let x = 0; x < GAMEBOARD_SIZE; x++) {
    let nextArray = [];

    for (let y = 0; y < GAMEBOARD_SIZE; y++) {
        nextArray.push(0);
    }

    gameBoard.push(nextArray);
}

// Positionne la tête du serpent
gameBoard[3][2] = 1;

// Positionne un pomme
gameBoard[6][6] = 3;

// Initialise le premier corps du serpent
bodyParts.push([4, 1]);

// Fonction qui affiche le jeu sous forme de table HTML
function showGameBoard() {
    // Transforme le gameBoard en table
    let html = "<table>";

    // Permet de connaitre la couleur de la case (paire/impaire)
    var cellIncreaser = true;
    let cellSize = window.innerWidth / GAMEBOARD_SIZE;

    for (let x = 0; x < GAMEBOARD_SIZE; x++) {

        html += "<tr>";
        cellIncreaser = !cellIncreaser;

        for (let y = 0; y < GAMEBOARD_SIZE; y++) {
            cellIncreaser = !cellIncreaser;

            document.title = window.innerHeight;
            while (cellSize * GAMEBOARD_SIZE >= window.innerHeight) {
                cellSize -= 15;
            }

            // 1 case sur 2 à cette couleur
            // #202C37
            // #243A44
            var cellColor = cellIncreaser ? "#202C37" : "#243A44";

            // en fonction du type de la case, on change son apparence
            if (gameBoard[x][y] == 1) {
                // tête
                cellColor = "#8136a3"
            }
            else if(gameBoard[x][y] == 2) {
                // body
                cellColor = "#a36496"
            }
            // La pomme est juste après, car elle ne prend pas tout l'espace

            html +=
                "<td style='width:" + cellSize + "px; height:" + cellSize + "px; background-color:" + cellColor + ";'>";

            if(gameBoard[x][y] == 3) {
                // apple "#db683d"
                // L'apple aura une margin sur la case et sera une div à l'intérieur de celle-ci
                html += "<div class='apple'></div>";
            }

            html += "</td>";
        }

        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("game_table").innerHTML = html;

    // Positionne game_information à droite du gameBoard
    var rect = document.getElementById("game_table").firstChild.getBoundingClientRect();
    document.getElementById("game_information").style.marginLeft = (rect.left + (GAMEBOARD_SIZE * cellSize) + 50) + "px";

}

// Obtient la position de la tête du serpent
function getHeadPos() {
    for (let x = 0; x < GAMEBOARD_SIZE; x++) {
        for (let y = 0; y < GAMEBOARD_SIZE; y++) {
            if (gameBoard[y][x] == 1) {
                return [y, x];
            }
        }
    }

    console.log("not found");
}

// Lance le timer du jeu
let gameTimer = setInterval(gameTick, 200);

// Fonction qui met à jour le jeu à chaque tick
function gameTick() {

    if(!hasLose)
    {
        // set la nouvelle direction que le joueur a choisi
        directionX = nextXdirection;
        directionY = nextYdirection;

        // Bouge en une direction
        var headPos = getHeadPos();

        // Check si on est sortie de la map ou pas avec la nouvelle direction
        // check si on n'est pas rentré dans nous-mêmes
        if(headPos[0] + directionY >= GAMEBOARD_SIZE ||
            headPos[0] + directionY < 0 || 
            headPos[1] + directionX >= GAMEBOARD_SIZE ||
            headPos[1] + directionX < 0 ||
            // predicate qui check si l'endroit où on veut aller est notre corps
            bodyParts.some(x => 
                x[0] == headPos[0] + directionY && x[1] == headPos[1] + directionX
                ))
        {
            // Lose
            hasLose = true;
            //clearInterval(gameTimer);

            document.getElementById("score_lose").innerHTML = "Score : " + score;
            document.getElementById("lose-menu").style.visibility = "visible";
            
            // set nouveau meilleur score
            if(score > parseInt((localStorage['snake_game_best_score'] || '0')))
            {
                localStorage['snake_game_best_score'] = score.toString();
                document.getElementById("new_best_score").style.visibility = "visible";
            }else{
                document.getElementById("new_best_score").style.visibility = "hidden";
            }

            return;
        }


        // La tête devient un body visuellement
        gameBoard[headPos[0]][headPos[1]] = 2;

        // Ajoute la tête comme étant un body 
        bodyParts.unshift([headPos[0], headPos[1]]);

        // Nouvelle position de la tête
        headPos = [headPos[0] + directionY, headPos[1] + directionX];

        // Si on mange une pomme
        if (gameBoard[headPos[0]][headPos[1]] == 3) {
            score++;

            // vérifie qu'il n'a pas gagné
            // corps + tête
            if(bodyParts.length + 1 == GAMEBOARD_SIZE * GAMEBOARD_SIZE)
            {
                window.alert("Impressionnant.. Tu as gagné..");
            }

            // replace la pomme dans un endroit random

            // Vérifie que l'endroit n'est pas un corps ni la tête 
            var rdnX = -1;
            var rdnY = -1;
            do {
                rdnX = randomIntFromInterval(0, GAMEBOARD_SIZE - 1);
                rdnY = randomIntFromInterval(0, GAMEBOARD_SIZE - 1);

            } while (bodyParts.some(element => element[0] == rdnY && element[1] == rdnX) ||
             rdnY == headPos[0] && rdnX == headPos[1]);

            // Ajoute la pomme
            console.log(rdnY + "," + rdnX);
            gameBoard[rdnY][rdnX] = 3;
        }

        if (bodyParts.length > score) {
            // Avance

            // Supprime le dernier body part visuellement
            gameBoard[bodyParts[bodyParts.length - 1][0]][
                bodyParts[bodyParts.length - 1][1]
            ] = 0;

            // supprime le dernier body part
            bodyParts.pop();
        }

        // Set la nouvelle position de la tête
        gameBoard[headPos[0] ][headPos[1]] = 1;
    }

    // Update le jeu
    showGameBoard();

    // Update le score
    document.getElementById("score").innerHTML = score;
}


// La prochaine direction joué ne sera pas sauvegardé directement
// dans une variable, car sinon le joueur faire glitch et 
// donc aller dans une mauvaise direction
let nextXdirection = 1;
let nextYdirection = 0;

// écoute les touches directionnelles
document.addEventListener("keydown", (event) => {
    // 

    if (event.code == "ArrowLeft") {
    // vérifie qu'on allait pas à droite
        if (directionX != 1) {
            nextXdirection = -1;
            nextYdirection = 0;
        }
    } else if (event.code == "ArrowRight") {
        // vérifie qu'on allait pas à gauche
        if (directionX != -1) {
            nextXdirection = 1;
            nextYdirection = 0;
        }
    } else if (event.code == "ArrowUp") {
        // vérifie qu'on allait pas en bas
        if (directionY != 1) {
            nextXdirection = 0;
            nextYdirection = -1;
        }

    } else if (event.code == "ArrowDown") {
        // vérifie qu'on allait pas en haut
        if (directionY != -1) {
            nextXdirection = 0;
            nextYdirection = 1;
        }

    }
});

// Affiche le jeu pour la première fois
showGameBoard();

document.getElementById("best-score").innerHTML = (localStorage['snake_game_best_score'] || '0');

// Utils
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


  
