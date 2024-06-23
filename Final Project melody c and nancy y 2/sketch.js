// Capstone Final Project
// Melody Chen and Nancy Yang
// June 23, 2024
// Building a platforming game with different features, levels, and modes

let captainCanuck, groundSensor, groundSensor2, coins, spikes, door, water;
let walkable, floortiles;
let playerImg1, playerImg2, floorTileImg, bgImg, coinsImg, platformImg, spikesImg, doorImg, lavaImg, lava2Img, blockImg, waterImg;
let backgroundMusic, coinSound, spikeSound;
const TILE_SIZE = 100;
let currentLevel = 0;
let score = 0;
let levelScore = 0; // Score for the current level
let skipButton, startGameButton, gameInfoButton, nextLevelButton, restartLevelButton, backButton;
let cameraOffsetX = 0;
let gameStarted = false;
let volumeSlider;
let showingLevelEndScreen = false;
let restartCount = 0; // Number of restarts in the current level
const MAX_RESTARTS = 3; // Maximum restarts allowed per level
let levelTextAlpha = 0; // Transparency of the level text
let showLevelText = false; // Whether to show the level text
let showingGameInfo = false; // Whether to show the game info page
let spiderMan;
let singlePlayerButton, doublePlayerButton;
let playMode = 'single'; //Set the initial play mode to be single player
let captainCanuckTouchedDoor = false;
let spiderManTouchedDoor = false;

//Load Images, music, and sound effects
function preload() {
  playerImg1 = loadImage("assets/1.png");
  playerImg2 = loadImage("assets/2.png");
  bgImg = loadImage("assets/avengers-tower.jpg");
  floorTileImg = loadImage("assets/tile1.png");
  platformImg = loadImage("assets/platform.png");
  coinsImg = loadImage("assets/coins.png");
  spikesImg = loadImage("assets/spikes.png");
  doorImg = loadImage("assets/door.png");
  lavaImg = loadImage("assets/lava.png");
  lava2Img = loadImage("assets/lava2.jpg");
  blockImg = loadImage("assets/block.png");
  waterImg = loadImage("assets/water.jpg");

  spikeSound = loadSound("assets/spike.mp3");
  coinSound = loadSound("assets/coin_sound.mp3");
  backgroundMusic = loadSound("assets/avengers_theme.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  //Add different buttons for different windows
  startGameButton = createButton('Start Game');
  styleButton(startGameButton, width / 4 - 50, height / 2);
  startGameButton.mousePressed(startGame);
 
  gameInfoButton = createButton('Game Info');
  styleButton(gameInfoButton, (3 * width) / 4 - 50, height / 2);
  gameInfoButton.mousePressed(showGameInfo);

  singlePlayerButton = createButton('Single Player');
  singlePlayerButton.position(10, 80);
  singlePlayerButton.mousePressed(function() {
    setPlayMode('single');
  });

  doublePlayerButton = createButton('Double Player');
  doublePlayerButton.position(10, 100);
  doublePlayerButton.mousePressed(function() {
    setPlayMode('double');
  });
 
  startGameButton.hide();
  gameInfoButton.hide();
 
  nextLevelButton = createButton('Next Level');
  styleButton(nextLevelButton, width / 4 - 50, height / 2 + 50);
  nextLevelButton.mousePressed(nextLevel);
  nextLevelButton.hide();
 
  restartLevelButton = createButton('Restart Level');
  styleButton(restartLevelButton, (3 * width) / 4 - 50, height / 2 + 50);
  restartLevelButton.mousePressed(restartLevel);
  restartLevelButton.hide();
 
  backButton = createButton('Back');
  styleButton(backButton, width / 2 - 50, height - 100);
  backButton.mousePressed(backToMain);
  backButton.hide();
  
  captainCanuck = new Player(0, 500, 70, 100);
  spiderMan = new Player2(0, 500, 70, 100);
  
  //Add a groundsensor to each character for detecting the ground
  groundSensor = createSprite(captainCanuck.x, captainCanuck.y + captainCanuck.height / 2, captainCanuck.width * 0.8, 5);
  groundSensor.visible = false;
  groundSensor.mass = 0.1;

  groundSensor2 = createSprite(spiderMan.x, spiderMan.y + spiderMan.height / 2, spiderMan.width * 0.8, 5);
  groundSensor2.visible = false;
  groundSensor2.mass = 0.1;

  walkable = new Group();
  floortiles = new Group();
  coins = new Group();
  spikes = new Group();
  door = new Group();
  water = new Group();

  //Add a skip button that allows the player to skip the current level
  skipButton = createButton('Skip');
  skipButton.position(10, 10);
  skipButton.mousePressed(skipLevel);
  skipButton.hide();
  
  volumeSlider = createSlider(0, 1, 0.5, 0.01); // Create a slider for volume control
  volumeSlider.position(10, 40); 

  showStartingScreen();
  backgroundMusic.loop();
}

function setPlayMode(mode) {
  playMode = mode;
}

//Press button R to restart the current level
function keyPressed() {
  if (key === 'R' || key === 'r') {
    if (restartCount < MAX_RESTARTS) {
      restartLevel();
      restartCount++;
    } 
    else {
      resetGame();
    }
  }
}

// Add a function to reset the player
function resetPlayer() {
  captainCanuck = new Player(0, 500, 70, 100);
  spiderMan = new Player(0, 500, 70, 100);
  cameraOffsetX = 0;
}

//Add some styles to the button 
function styleButton(button, x, y) {
  button.position(x, y);
  button.style('font-size', '24px');
  button.style('background-color', '#d62900'); // Avengers theme color
  button.style('color', '#FFFFFF');
  button.style('padding', '15px 30px');
  button.style('border', 'none');
  button.style('border-radius', '10px');
  button.style('cursor', 'pointer');
  button.style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)');
  button.style('text-transform', 'uppercase'); 
  button.mouseOver(() => button.style('background-color', '#a10000'));
  button.mouseOut(() => button.style('background-color', '#d62900'));
}

function draw() {
  if (!gameStarted) {    //Display starting screen
    if (showingGameInfo) {
      showGameInfoPage();
    } 
    else {
      showStartingScreen();
    }
  } 
  else if (showingLevelEndScreen) {  //Display level end screen when the current level is passed
    showLevelEndScreen();
  } 
  else {
    playGame();
  }

  if (showLevelText) {
    displayLevelText();
  }
  backgroundMusic.setVolume(volumeSlider.value());  //Allow the player to change the volume of the background music
}

//Draw the starting screen
function showStartingScreen() {
  background(bgImg);

  // Text settings
  textFont('Impact');
  textSize(100);
  textAlign(CENTER, CENTER);

  // Shadow effect
  fill(0, 0, 0, 150); 
  for (let i = 5; i <= 7; i++) {
    text('Avengers: Captain Canuck', width / 2 + i, height / 2 - 100 + i);
  }

  // Main text
  fill(0, 102, 255); 
  text('Avengers: Captain Canuck', width / 2, height / 2 - 100);

  // Emboss effect
  fill(255, 255, 255, 200);
  for (let i = -3; i <= -1; i++) {
    for (let j = -3; j <= -1; j++) {
      if (i !== 0 || j !== 0) {
        text('Avengers: Captain Canuck', width / 2 + i, height / 2 - 100 + j);
      }
    }
  }

  // Reflection effect
  push();
  scale(1, -1); 
  translate(0, -height); 
  fill(0, 102, 255, 100); 
  text('Avengers: Captain Canuck', width / 2, height / 2 - 150);
  pop();

  startGameButton.show();
  gameInfoButton.show();
}

//Start the game if the start game button is clicked
function startGame() {
  gameStarted = true;
  showingGameInfo = false;
  startGameButton.hide();
  gameInfoButton.hide();
  backButton.hide();
  skipButton.show();
  drawMap();

  captainCanuck = new Player(0, 500, 70, 100);
  spiderMan = new Player2(0, 500, 70, 100);

  levelScore = 0; // Reset level score
  restartCount = 0; // Reset restart count for the level
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency
}

function playGame() {
  background(bgImg);
  
  //Adjust the location for the groundsensors 
  groundSensor.position.x = captainCanuck.x + 28;
  groundSensor.position.y = captainCanuck.y + captainCanuck.height;

  groundSensor2.position.x = spiderMan.x + 28;
  groundSensor2.position.y = spiderMan.y + spiderMan.height;

  //Check if each character is on ground
  captainCanuck.onGround = groundSensor.overlap(walkable);
  spiderMan.onGround = groundSensor2.overlap(walkable);
  
  //Detect collisions with the coins and enable each character to gain scores if touching coins
  captainCanuck.sprite.overlap(coins, (player, coin) => {
    coin.remove();
    score += 1;
    levelScore += 1; 
    coinSound.play();
  });
  
  spiderMan.sprite.overlap(coins, (player, coin) => {
    coin.remove();
    score += 1;
    levelScore += 1; 
    coinSound.play();
  });

  //Check collisions with the spikes and restart current level is touching spikes
  captainCanuck.sprite.overlap(spikes, (player, spike) => {
    captainCanuck = new Player(0, 500, 70, 100);
    spikeSound.play();
  });

  spiderMan.sprite.overlap(spikes, (player, spike) => {
    spiderMan = new Player2(0, 500, 70, 100);
    spikeSound.play();
  });

  //End current level when reaches the door
  if (playMode === "single") { 
    captainCanuck.sprite.overlap(door, (player, doorSprite) => {
      showLevelEndScreen();
    });
  }
  else if (playMode === "double") { //For a double player mode, both players need to reach the door to pass current level
    //Check if Captain Canuck touches the door
    captainCanuck.sprite.overlap(door, (player, doorSprite) => {  
      captainCanuckTouchedDoor = true;
      checkBothPlayersTouchedDoor();
    });
  
    // Check if spiderMan touches the door
    spiderMan.sprite.overlap(door, (player, doorSprite) => {
      spiderManTouchedDoor = true;
      checkBothPlayersTouchedDoor();
    });
  }

  //Check if each character is on water
  captainCanuck.sprite.overlap(water, (player, waterSprite) => {  
    captainCanuck.onWater = true;
  });

  spiderMan.sprite.overlap(water, (player, waterSprite) => {  
    spiderMan.onWater = true;
  });

  captainCanuck.move();

  //Set up a camera to move with the character
  if (playMode === "single") {
    if (captainCanuck.x - cameraOffsetX > width / 2) {
      cameraOffsetX = captainCanuck.x - width / 2;
    }
    else if (captainCanuck.x - cameraOffsetX < width / 4) {
      cameraOffsetX = captainCanuck.x - width / 4;
    }
  }
  else  if (playMode === "double") {
    if (captainCanuck.x > spiderMan.x) {
      //If Captain Canuck is on the right, follow his camera to go right
      if (captainCanuck.x - cameraOffsetX > width / 2) {
        cameraOffsetX = captainCanuck.x - width / 2;
      } 
    } 
    else if (captainCanuck.x < spiderMan.x) {
      // If Spider-Man is on the right, follow his camera to go right
      if (spiderMan.x - cameraOffsetX > width / 2) {
        cameraOffsetX = spiderMan.x - width / 2;
      } 
    }
    if (captainCanuck.x < spiderMan.x) {
      // If Captain Canuck is on the left, follow his camera to go left
      if (captainCanuck.x - cameraOffsetX < width / 4) {
        cameraOffsetX = captainCanuck.x - width / 4;
      }
    }  
    else if (captainCanuck.x > spiderMan.x) {
       // If Spider-Man is on the left, follow his camera to go left
      if (spiderMan.x - cameraOffsetX < width / 4) {
        cameraOffsetX = spiderMan.x - width / 4;
      }
    }
  }

  push();
  translate(-cameraOffsetX, 0);

  captainCanuck.display();

  //Only display Spider-Man if the play mode is double player
  if (playMode === "double") {
    spiderMan.move();
    spiderMan.display();
  } 

  drawSprites();
  pop();

  //Game ends if collect more than 45 coins(scores)
  if (score >= 45) {
    showWinningMessage();
  }

  fill(255);
  textSize(32);
  textAlign(RIGHT, TOP);
  text('Score: ' + score, width - 10, 10);
  text('Restarts: ' + (MAX_RESTARTS - restartCount), width - 10, 50); // Display remaining restarts
}

// Check if both characters reach the door
function checkBothPlayersTouchedDoor() {
  if (captainCanuckTouchedDoor && spiderManTouchedDoor) {
    showLevelEndScreen();
    captainCanuckTouchedDoor = false;
    spiderManTouchedDoor = false;
  }
}

//Display current level text
function displayLevelText() {
  textFont('Impact');
  textSize(100);
  textAlign(CENTER, CENTER);
  fill(255, 255, 255, levelTextAlpha); 
  text('Level ' + (currentLevel + 1), width / 2, height / 2);

  // Decrease transparency
  levelTextAlpha -= 5;
  if (levelTextAlpha <= 0) {
    showLevelText = false;
  }
}

//Draw end level screen
function showLevelEndScreen() {
  showingLevelEndScreen = true;
  background(bgImg);
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text('Level Complete!', width / 2, height / 2 - 100);
  text('Score: ' + score, width / 2, height / 2);

  nextLevelButton.show();
  restartLevelButton.show();
}

//Draw game info page
function showGameInfoPage() {
  background(bgImg);

  // Text settings
  textFont('Impact');
  textSize(100);
  textAlign(CENTER, CENTER);
  fill(255, 255, 255);

  // Main text
  text('Game Info', width / 2, height / 2 - 300);

  // Smaller text
  textFont('Arial');
  textSize(24);
  fill(255); 
  textAlign(CENTER, TOP); 
  //Game Info text
  text(`1. This game has an infinite number of levels in total
    Your goal is to collect as many coins as possible. You win if you collect 45 coins
2. Press “R” or “r” to restart, you have 3 chances in one level
    if 3 chances are running out, the game will restart from level 1
3. Select your play mode at the top left (Single Player Mode/Double Player Mode) 
For the double player mode, both players need to cooperate with each other 
The level can only be passed when both players reach the door
4. Captain Canuck :                    Spider-Man: 
    left arrow → move left            A → move left
    right arrow → move right          D → move right
     up arrow → jump                   S → jump
left/right arrow + up arrow → long jump  A/D + S → long jump
5. Do NOT touch SPIKES or LAVA; otherwise, you will have to restart (evil face)
6. You can walk on/in water, but it will slow you down
`, width / 2, height / 2 - 250);

  // Good luck text
  textFont('Impact');
  textSize(100);
  fill(255, 255, 255); 
  text('GOOD LUCK!', width / 2, height - 250);

  backButton.show();
}

//Allow the player the reach next level
function nextLevel() {
  showingLevelEndScreen = false;
  nextLevelButton.hide();
  restartLevelButton.hide();

  //Clear different sprites from the previous level
  floortiles.removeSprites();
  floortiles.clear();

  walkable.removeSprites();
  walkable.clear();

  coins.removeSprites();
  coins.clear();

  spikes.removeSprites();
  spikes.clear();

  door.removeSprites();
  door.clear();

  currentLevel++;

  //Generate random maps after level 10
  if (currentLevel >= TILE_MAPS.length) {
      TILE_MAPS.push(generateTileMap(8)); 
  }

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
  spiderMan = new Player2(0, 100, 70, 100);
  cameraOffsetX = 0;
  levelScore = 0; // Reset level score
  restartCount = 0; // Reset restart count for the level
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency

  // Reset door touch flags
  captainCanuckTouchedDoor = false;
  spiderManTouchedDoor = false;
}

//Reset current level
function restartLevel() {
  showingLevelEndScreen = false;
  nextLevelButton.hide();
  restartLevelButton.hide();

  score -= levelScore; // Deduct the level score from the total score
  levelScore = 0; // Reset level score

  //Clear different sprites and their images
  floortiles.removeSprites();
  floortiles.clear();

  walkable.removeSprites();
  walkable.clear();

  coins.removeSprites();
  coins.clear();

  spikes.removeSprites();
  spikes.clear();

  door.removeSprites();
  door.clear();

  water.removeSprites();
  water.clear();

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
  spiderMan = new Player2(0, 100, 70, 100);
  cameraOffsetX = 0;
  cameraOffsetX = 0;
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency

  // Reset door touch flags
  captainCanuckTouchedDoor = false;
  spiderManTouchedDoor = false;
}

//Reset the game
function resetGame() {
  score = 0;
  levelScore = 0;
  currentLevel = 0;
  restartCount = 0;

  floortiles.removeSprites();
  floortiles.clear();

  walkable.removeSprites();
  walkable.clear();

  coins.removeSprites();
  coins.clear();

  spikes.removeSprites();
  spikes.clear();

  door.removeSprites();
  door.clear();

  water.removeSprites();
  water.clear();

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
  captainCanuck2 = new Player2(100, 100, 70, 100);
  cameraOffsetX = 0;
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency
}

//Allow the player to skip current level
function skipLevel() {
  nextLevel();
}

//Display game info
function showGameInfo() {
  showingGameInfo = true;
  startGameButton.hide();
  gameInfoButton.hide();
}

//Return to starting screen when finished reading game info
function backToMain() {
  showingGameInfo = false;
  showStartingScreen();
}

//Display the winning message
function showWinningMessage() {
  background(bgImg);
  textFont('Impact');
  textSize(200);
  fill(255, 255, 255); 
  text('You Win!', width / 2, height / 2);
  singlePlayerButton.hide();
  doublePlayerButton.hide();
  skipButton.hide();
}

//Enable the character to be displayed and move(used for Captain Canuck)
class Player {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.onGround = false;
    this.jump = false;
    this.player = playerImg1;
    this.facingRight = true;
    this.sprite = createSprite();
    this.onWater = false;

    this.sprite.visible = false;
  }

  //Left arrow to go left and right arrow to go right
  move() {
    if (!this.onGround) {
      this.speedY += 0.3; // Gravity
      if (keyIsDown(LEFT_ARROW)) {
        this.speedX -= 0.3;
        this.facingRight = false;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.speedX += 0.3;
        this.facingRight = true;
      }
      this.speedX *= 0.98;
    }
    else {
      this.speedY = 0;
      if (!this.onWater) {
        if (keyIsDown(LEFT_ARROW)) {  
          this.speedX -= 1.2;
          this.facingRight = false;
        }
        if (keyIsDown(RIGHT_ARROW)) {
          this.speedX += 1.2;
          this.facingRight = true;
        }
      }
      else if (this.onWater) {  //If on water, slow down
        if (keyIsDown(LEFT_ARROW)) {  
          this.speedX -= 0.3;
          this.facingRight = false;
        }
        if (keyIsDown(RIGHT_ARROW)) {
          this.speedX += 0.3;
          this.facingRight = true;
        }
        this.onWater = false;
      } 

      if (keyIsDown(UP_ARROW) && this.onGround) {
        this.jump = true;
      }
      if (this.jump) {
        this.speedY = -10;
        this.jump = false;
        this.onGround = false;
      }
      this.speedX *= 0.8;
    }

    //Constrain the speed range
    this.speedX = constrain(this.speedX, -10, 10);

    this.y += this.speedY;
    this.x += this.speedX;

    //Adjust the location of the sprite to detect coins/spikes
    this.sprite.position.x = this.x + this.player.width / 4;
    this.sprite.position.y = this.y + this.player.height;
  }

  display() { // Display the player and let the player face the direction it is going
    push();
    translate(this.x + this.width/ 2, this.y + this.height / 2);
    if (!this.facingRight) {
      scale(-1, 1);
    }
    imageMode(CENTER);
    image(this.player, 0, 0, this.width, this.height);

    pop();
  }
}

//Enable the character to be displayed and move(Used for Spider-Man)
class Player2 {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.onGround = false;
    this.jump = false;
    this.player = playerImg2;
    this.facingRight = true;
    this.sprite = createSprite();
    this.onWater = false;

    this.sprite.visible = false;
  }

  //Key A to go left and key D to go right
  move() {
    if (!this.onGround) {
      this.speedY += 0.3; // Gravity
      if (keyIsDown(65)) {    
        this.speedX -= 0.3;
        this.facingRight = false;
      }
      if (keyIsDown(68)) {
        this.speedX += 0.3;
        this.facingRight = true;
      }
      this.speedX *= 0.98;
    }
    else {
      this.speedY = 0;
      if (!this.onWater) {
        if (keyIsDown(65)) {
          this.speedX -= 1.2;
          this.facingRight = false;
        }
        if (keyIsDown(68)) {
          this.speedX += 1.2;
          this.facingRight = true;
        }
      }
      else if (this.onWater) {   //If on water, slow down
        if (keyIsDown(65)) {
          this.speedX -= 0.3;
          this.facingRight = false;
        }
        if (keyIsDown(68)) {
          this.speedX += 0.3;
          this.facingRight = true;
        }
        this.onWater = false;
      }

      if (keyIsDown(87) && this.onGround) {
        this.jump = true;
      }

      if (this.jump) {
        this.speedY = -10;
        this.jump = false;
        this.onGround = false;
      }
      this.speedX *= 0.8;
    }

    //Constrain the speed range
    this.speedX = constrain(this.speedX, -10, 10);

    this.y += this.speedY;
    this.x += this.speedX;

    //Adjust the location of the sprite to check collisions with coins/spikes
    this.sprite.position.x = this.x + this.player.width / 2;
    this.sprite.position.y = this.y + this.player.height * 1.5;
  }

  display() { // Display the player and let the player face the direction it is going
    push();
    translate(this.x + this.width/ 2, this.y + this.height / 2);
    if (!this.facingRight) {
      scale(-1, 1);
    }
    imageMode(CENTER);
    image(playerImg2, 0, 0, this.width, this.height);
    pop();
  }
}

//Add diffferent sprites(tiles, spikes, coins...) to the map
function drawMap() {
  let tileMap = TILE_MAPS[currentLevel];

  //Add floor tile sprites
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      if (tileMap[row][col] === 'f') {
        let floorTile = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        floorTile.addImage(floorTileImg);
        floorTile.scale = (TILE_SIZE * 2) / floorTileImg.width;
        floortiles.add(floorTile);

        //Add a sprite on top of the floor tiles, so the characters can only walk on top of it
        let topCollision = createSprite(col * TILE_SIZE, row * TILE_SIZE - TILE_SIZE / 2, TILE_SIZE * 2, 10);
        topCollision.visible = false;
        walkable.add(topCollision);
      }

      //Add block sprites
      if (tileMap[row][col] === 'b') {
        let blockSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        blockSprite.addImage(blockImg);
        blockSprite.scale = 2.5;
        floortiles.add(blockSprite);

        //Add a sprite on top of the blocks, so the characters can only walk on top of it
        let blockCollision = createSprite(col * TILE_SIZE, row * TILE_SIZE - (blockSprite.height * 2.5) / 2, TILE_SIZE, 10);
        blockCollision.visible = false;
        walkable.add(blockCollision);
      }

      //Add coin sprites which are part of the coins group
      if (tileMap[row][col] === 'c') {
        let coin = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        coin.addImage(coinsImg);
        coin.scale = 0.3;
        coins.add(coin);
      }

      //Add spike sprites which are part of the spikes group
      if (tileMap[row][col] === 's') {
        let spike = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        spike.addImage(spikesImg);
        spike.scale = 0.3;
        spikes.add(spike);
      }

      //Add door sprites which are part of the door group
      if (tileMap[row][col] === 'd') {
        let doorSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        doorSprite.addImage(doorImg);
        doorSprite.scale = 0.3;
        door.add(doorSprite);
      }

      //Add platform sprites which are considered to be walkable
      if (tileMap[row][col] === 'p') {
        let platformSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        platformSprite.addImage(platformImg);
        walkable.add(platformSprite);
      }

      //Add lava sprites which are part of the spikes group(since they have the same function)
      if (tileMap[row][col] === 'l') {
        let lavaSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        lavaSprite.addImage(lavaImg);
        lavaSprite.scale = 0.9;
        spikes.add(lavaSprite);
      }

      //Add lava block sprites which are part of the spike group(since they have the same function)
      if (tileMap[row][col] === 'L') {
        let lava2Sprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        lava2Sprite.addImage(lava2Img);
        lava2Sprite.scale = 1;
        spikes.add(lava2Sprite);
      }

      //Add water sprites which are walkable and part of the water group
      if (tileMap[row][col] === 'w') {
        let waterSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        waterSprite.addImage(waterImg);
        waterSprite.scale = 2.5;
        walkable.add(waterSprite);
        water.add(waterSprite);
      }
    }
  }
}

//Draw random maps
function generateTileMap(numberOfRows) {
  // Define the number of columns in the tile map
  const numberOfColumns = 16;

  // Create a 2D array to represent the tile map
  const tileMap = new Array(numberOfRows)
    .fill(null)
    .map(_ => new Array(numberOfColumns).fill(null));

  // Define the starting row where the player begins
  const startingRow = numberOfRows - 2;

  // Initialize the starting row with floor tiles
  tileMap[startingRow] = new Array(numberOfColumns).fill('.');

  // Place starting blocks and the door
  let randomDoorIndex = Math.max(8, Math.floor(Math.random() * numberOfColumns));
  tileMap[5][randomDoorIndex] = 'b'; // Block before the door
  tileMap[5][randomDoorIndex - 1] = 'b'; // Additional block that leads to the door
  tileMap[4][randomDoorIndex] = 'd'; // Door
  tileMap[startingRow + 1][0] = 'b'; // Starting block

  // Ensure the number of tiles placed is at least 6 and most 8 to make sure the random map level can be passed
  let tileCount = 0;
  const minTiles = 6;
  const maxTiles = 8;
  const minTilesPerRow = 1;

  let rowsWithTiles = new Set();

  // Randomly place tiles in rows
  for (let i = startingRow; i >= 2; i--) {
    if (rowsWithTiles.size >= 4) break; // Ensure only 4 rows have tiles
    let tilesPlacedInRow = 0;
    for (let j = 0; j < randomDoorIndex; j++) {
      if (tileCount >= maxTiles) break; // Ensure maximum tiles are placed
      if (tileCount < minTiles || Math.random() < 0.3) { // Randomly decide to place a tile
        if (Math.random() < 0.5) { // Place either a block or water tile
          tileMap[i][j] = 'b'; 
       } 
        else {
          tileMap[i][j] = 'w';
       }; 
        tileCount++;
        tilesPlacedInRow++;
        rowsWithTiles.add(i);
      }
    }
    if (tileCount >= maxTiles) break; // Ensure maximum tiles are placed
    if (tilesPlacedInRow < minTilesPerRow) { // Ensure minimum tiles per row
      const randomColumnIndex = Math.floor(Math.random() * randomDoorIndex);
      if (Math.random() < 0.5) {  // Place a block or water tile randomly
        tileMap[i][randomColumnIndex] = 'b';
      } 
      else {
        tileMap[i][randomColumnIndex] = 'w';
      }
      tileCount++;
      rowsWithTiles.add(i);
    }
  }

  // Add coins ('c') or spikes ('s') on top of the tiles
  // Ensure only one spike is placed and it isn't in specific columns
  let spikePlaced = false;
  for (let i = startingRow; i >= 3; i--) {
    for (let j = 2; j < randomDoorIndex - 1; j++) {
      if (tileMap[i][j] === 'b' || tileMap[i][j] === 'w') { // Check if the tile is a block or water
        if (Math.random() < 0.5) { // Randomly decide to place a coin or spike
          if (!spikePlaced && Math.random() < 0.5) { // Place a spike if not already placed
            if (tileMap[i + 1][j - 1] !== '.' && tileMap[i + 1][j + 1] !== '.' ) { // Ensure spike placement is valid 
                                                                               //to make sure the spike will not block the way to the door
              tileMap[i-1][j] = 's'; 
              spikePlaced = true;
            } 
            else {
              tileMap[i - 1][j] = 'c'; // Place a coin if spike cannot be placed
            }
          } 
          else {
            tileMap[i - 1][j] = 'c'; // Place a coin if spike is already placed
          }
        }
      }
    }
  }

  return tileMap; 
}

//Draw tile maps for different levels
//(This size is adjusted for the school computer screen. The complete map may not be fully visible on other computers)
const TILE_MAPS = [
  [ //Level 1
    '...................',
    '...................',
    '..................d',
    '...............c..f',
    '...............f...',
    '..........c..f.....',
    '.....c.f..f........',
    '...csf.............',
    '...f...............',
    'ppppppppppppppppppp',
    '...................',
    '...................'
  ],

  [ //Level 2
    '......................',
    '......................',
    '............d.........',
    '.........c..f.........',
    '...c..f..f............',
    '...f..................',
    '.....f.....cs.........',
    '........f..f..........',
    '.....f.s..............',
    'pppppppppppppppppppppp',
    '......................',
    '......................'
  ],

  [ //Level 3
    '....................',
    '....................',
    '.................d..',
    '.................f..',
    '.............f.c....',
    '...............f....',
    '..........c..f......',
    '.......c..f.........',
    '...f.s.f............',
    'pppppppppppppppppppp',
    '....................',
    '....................'
  ],

  [ //Level 4
    '.....................',
    '.....................',
    '.....................',
    '....................d',
    '................s...f',
    '.........c.....f.f...',
    '...c.f...f..f........',
    '...f..c..............',
    '......f..............',
    'ppppppppppppppppppppp',
    '.....................',
    '.....................'
  ],
  
  [ //Level 5
   '.......................',
    '......................',
    '..d...................',
    '..f..c................',
    '.....f......c.........',
    '........f...f..c......',
    '...............f......',
    '..................f...',
    '.....s....s.f..f....c.',
    'pppppppppppppppppppppp',
    '......................',
    '......................'
  ],
  [ //Level 6
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '......c..c..........',
    '....c.f..f..........',
    '....f........c...s.d',
    'ppp...l.....ppppppp.',
    '....................',
    '....................'
  ],

  [ //Level 7
   '....................',
    '...................',
    '...................',
    '..............c...d',
    '..............s...f',
    '..........c..f.f...',
    '.......c..f........',
    '....c..f...........',
    '....f..............',
    'pp....l.....l....l.',
    '...................',
    '...................'
  ],

  [ //Level 8
   '.....................',
    '....................',
    '.......c....d.......',
    '..... bbbLLbbb......',
    '...c.b..............',
    '..bbb...............',
    '.....bb..c.s........',
    '..c....bbbbb........',
    'bbbbbb..............',
    '....................',
    '....................',
    '....................'
  ],

  [ //Level 9
    '.......................',
    '.......................',
    '.......................',
    '.......................',
    '....................c.d',
    '..................sbbbb',
    '.c...bbwwbb..c..bbb....',
    'bbbb........bbb........',
    '.......................',
    '.......................',
    '.......................'
  ],

  [ //Level 10
    '..................................',
    '..................................',
    '..................................',
    '.............c....................',
    '............bbLLbb..c............',
    '......c..bb.........bbb...c.......',
    '..s..bbb.................bb.....cd',
    'bbbbb.......................bbbLbb',
    '..................................',
    '..................................',
    '...................................'
  ],
];


