// Javascript Source Code for Game

// CONSTANTS
var CANVAS_WIDTH = 500;
var CANVAS_HEIGHT = 500;
var FPS = 30;
var GRAVITY = 9.8 * 0.075;
var ACCELERATION = 0.75;

/*var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height - CANVAS_HEIGHT;*/

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
          "' height='" + CANVAS_HEIGHT + "'></canvas");

var canvas = canvasElement.get(0).getContext("2d");
        canvasElement.appendTo('body');

//document.body.appendChild(canvas);

/// *** Background *** ///
var bg =
{
    color: "#00A",
    x: 0,
    y: 0,
    height: CANVAS_HEIGHT,
    width: CANVAS_WIDTH,
    draw: function()
    {
        canvas.fillStyle = this.color;
        canvas.fillRect(this.x, this.y, this.width, this.height);
    }
};

// set the sprite
bg.sprite = Sprite("candyBG");

bg.draw = function()
{
    this.sprite.draw(canvas, this.x - playerGO.x * 0.5, this.y - playerGO.y * 0.5);
};

/// *** Player GameObject *** ///
var playerGO = 
{
    color: "#00A",
    x: 50,
    y: 385,
    height: 30,
    width: 70,
    currentColor: "Blue",
    xVelocity: 0,

   draw: function()
   {
       canvas.fillStyle = this.color;
       canvas.fillRect(this.x, this.y, this.width, this.height);
   }
};

playerGO.changeColor = function(newColor)
{
    this.currentColor = newColor;
}

// player sprite
playerGO.sprite = Sprite("blueBasket");

// Player Functions
playerGO.draw = function ()
{
    this.sprite.draw(canvas, this.x, this.y);

    if (this.currentColor == "Blue") playerGO.sprite = Sprite("blueBasket");
    if (this.currentColor == "Red") playerGO.sprite = Sprite("redBasket");
    if (this.currentColor == "Yellow") playerGO.sprite = Sprite("yellowBasket");
};

// Player midpoint function
playerGO.midPoint = function() 
{
    return {
    x: this.x + this.width * 1.25,
    y: this.y + this.height / 2
    };
};


playerGO.explode = function()
{
    this.active = false;
    // Add Explosion Sound here
    Sound.play("explosion");
};

/// *** Enemy Functions *** ///
// Enemy data structure
enemyList = [];  // array of enemies

// Enemy Class
function Enemy(I)
{
    I = I || {}; // constructor

    I.active = true; // set the entity default to true
    I.age = Math.floor(Math.random() * 128);

    I.color = "#A2B"; // color of the enemy sprite.. you can change this by using the ASCI code of the color
    I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;  // create the enemy randomly inside the canvas
    I.y = 0; // if you also want to conver the Y axis to go random just copy and paste the upper code and change CANVAS_WIDTH to CANVAS_HEIGHT
    I.xVelocity = 0; // x speed
    I.yVelocity = 0; // y speed

    I.width = 32; //  width in pixels
    I.height = 32; // height in pixels

    I.colorIndex = Math.floor(Math.random() * 3);

    if (I.colorIndex == 0) I.currentColor = "Blue";
    if (I.colorIndex == 1) I.currentColor = "Red";
    if (I.colorIndex == 2) I.currentColor = "Yellow";

    // Inbounds function of the enemy... same as the bullet
    I.inBounds = function()
    {
        return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };

    // Sprite of the Enemy
    I.sprite = Sprite("enemy3");

    // Render/Draw function of the Enemy class.. same as the bullet class
    I.draw = function()
    {
        /*canvas.fillStyle = this.color;
        canvas.fillRect(this.x, this.y, this.width, this.height);*/
        this.sprite.draw(canvas, this.x, this.y);

        if (I.currentColor == "Blue") I.sprite = Sprite("blueCandy");
        if (I.currentColor == "Red")I.sprite = Sprite("redCandy");
        if (I.currentColor == "Yellow")I.sprite = Sprite("yellowCandy");
    };

    I.fallVelocity = function()
    {
        this.yVelocity += GRAVITY;
    }

    // Update function of the Enemy class... same as the bullet class
    I.update = function()
    {
        // Add the velocities to update the position of the enemy
        //I.x += I.xVelocity;
        I.y += I.yVelocity;

        I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64); // creates a wavy length movement for the X movement of the enemy.. think like the blinking effect of the shader in Unreal Engine 4

        I.age++; // increment the age.. same like the TimeData in Unreal Engine 4 Material editor

        I.active = I.active && I.inBounds(); // check if it is still within the bounds of the canvas
    };

    // Enemy explode function
    I.explode = function()
    {
        this.active = false;
        // Add sound effect of explosion here
        //Sound.play("explosion");
    };

    return I;
};

/// *** Game Data *** ///
var score = 0;
var playerLife = 3;
var canChange = true;
var isMoving = false;
var colorIndex = 0;

function playerIsAlive()
{
    return playerLife > 0;
}

/// *** Game Proper Functions *** ///

// Interval function.. think of deltaTime in Unreal Engine 4
setInterval(function() 
{
    update();
    draw();
}, 1000 / FPS);

// Render
function draw() 
{
    canvas.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // draw the background
    bg.draw();

    playerGO.draw();  // Draws the playerGO

    // render the enemies
    enemyList.forEach(function(enemy)
    {
        enemy.draw();
    });

    // Render the score
    canvas.fillStyle = "rgb(0, 0, 0)";
    canvas.font = "14px Courier";
    canvas.textAlign = "left";
    canvas.textBaseline = "top";
    canvas.fillText("Score: " + score, 16, 16);

    // Render the PlayerLife
    canvas.textAlign = "bottom";
    canvas.fillText("Life: " + playerLife, 16, 30);

    // Render Current Color
    canvas.textAlign = "bottom";
    canvas.fillText("Current Color: " + playerGO.currentColor, 16, 44);

    canvas.font = "16px Courier";
    canvas.textAlign = "bottom";
    canvas.fillText("Press [Up] or [Down] to change colors", 75, 450);
    canvas.fillText("Press [Left] or [Right] to move", 100, 475);

    if (playerLife <= 0)
    {
        canvas.fillStyle = "rgb(255, 0, 0)"; // color use RGB decimal color scheme not the HEX
        canvas.font = "72px Courier";
        canvas.textAlign = "center";
        canvas.textBaseline = "top";
        canvas.fillText("GAME OVER", CANVAS_WIDTH / 2, 120);

    }
}

// Collision Detection Algorithm of Gameobject A to Gameobject B
function handleCollision(a, b)
{
    return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

// Checks and updates the collision
function checkCollision()
{
    // check collision for player and enemy
    enemyList.forEach(function(enemy)
    {
        if (handleCollision(enemy, playerGO))
        {
            if (enemy.currentColor == playerGO.currentColor)
            {
                score++;
                Sound.play("ding");
            }
            else
            {
                playerLife--;
                Sound.play("buzz");
            }

            enemy.explode();
            console.log("Life: " + playerLife);
            console.log("Score: " + score);
        }
    });
}

// *** GAME LOOP *** //
function update() 
{
    if (!playerIsAlive()) return;
    playerGO.x += playerGO.xVelocity;

    // Player GO Controls//
    // Player Movement
    if (keydown.up && canChange)
    {
        if (colorIndex < 2) colorIndex++;
        else colorIndex = 0;

        canChange = false;
    }

    if (keydown.down && canChange)
    {
        if (colorIndex > 0) colorIndex--;
        else colorIndex = 2;

        canChange = false;
    }

    if (!keydown.up && !keydown.down && !canChange)
    {
        canChange = true;
    }

    if(keydown.left) 
        playerGO.xVelocity -= ACCELERATION;

    if(keydown.right)
        playerGO.xVelocity += ACCELERATION;

    if(!keydown.left && !keydown.right)
    {
        if (playerGO.xVelocity > 0) {
            playerGO.xVelocity -= ACCELERATION;
            if (playerGO.xVelocity < 0) playerGO.xVelocity = 0;
        }

        if (playerGO.xVelocity < 0) {
            playerGO.xVelocity += ACCELERATION;
            if (playerGO.xVelocity > 0) playerGO.xVelocity = 0;
        }
    }

    if (!canChange)
    {
        if (colorIndex == 0) playerGO.changeColor("Blue");
        if (colorIndex == 1) playerGO.changeColor("Red");
        if (colorIndex == 2) playerGO.changeColor("Yellow");
    }

    // Clamp the position so that it won't go out of bounds
    playerGO.x = playerGO.x.clamp(0, CANVAS_WIDTH - playerGO.width);


    // Update the enemies
    enemyList.forEach(function(enemy)
    {
        enemy.fallVelocity();
        enemy.update();
    });

    // filter out if the enemy is still in bounds
    enemyList = enemyList.filter(function(enemy)
    {
        return enemy.active;
    });

    // Spawning algorithm for the enemies
    if (Math.random() < 0.025) // you can change the time interval
        enemyList.push(Enemy());
    
    // Update the collision detection
    checkCollision();
}

// BGM
if (playerIsAlive())
    Sound.play("Hopscotch");
else
{
    Sound.stop("test");
    // Player GO
    Sound.play("Hopscotch");
}

// Cross browser support for the request animation frame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Run Game
var date = Date.now();
//udpate();
