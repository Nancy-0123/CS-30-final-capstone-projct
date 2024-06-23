let captainCanuck, groundSensor, coins, spikes, door;
let walkable, floortiles;
let playerImg1, playerImg2, floorTileImg, bgImg, coinsImg, platformImg, spikesImg, doorImg, lavaImg, lava2Img, blockImg, waterImg;
let backgroundMusic, coinSound;
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

  coinSound = loadSound("assets/coin_sound.mp3");
  backgroundMusic = loadSound("assets/avengers_theme.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  startGameButton = createButton('Start Game');
  styleButton(startGameButton, width / 4 - 50, height / 2);
  startGameButton.mousePressed(startGame);

  gameInfoButton = createButton('Game Info');
  styleButton(gameInfoButton, (3 * width) / 4 - 50, height / 2);
  gameInfoButton.mousePressed(showGameInfo);

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

  groundSensor = createSprite(captainCanuck.x, captainCanuck.y + captainCanuck.height / 2, captainCanuck.width * 0.8, 5);
  groundSensor.visible = false;
  groundSensor.mass = 0.1;

  walkable = new Group();
  floortiles = new Group();
  coins = new Group();
  spikes = new Group();
  door = new Group();

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

//Press button D to reset the restart the current level
function keyPressed() {
  if (key === 'D' || key === 'd') {
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

//Display game info screen and level end screen
function draw() {
  if (!gameStarted) {
    if (showingGameInfo) {
      showGameInfoPage();
    } 
    else {
      showStartingScreen();
    }
  } 
  else if (showingLevelEndScreen) {
    showLevelEndScreen();
  } 
  else {
    playGame();
  }

  if (showLevelText) {
    displayLevelText();
  }
  backgroundMusic.setVolume(volumeSlider.value());
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

//
function startGame() {
  gameStarted = true;
  showingGameInfo = false;
  startGameButton.hide();
  gameInfoButton.hide();
  backButton.hide();
  skipButton.show();
  drawMap();

  captainCanuck = new Player(0, 500, 70, 100);
  levelScore = 0; // Reset level score
  restartCount = 0; // Reset restart count for the level
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency
}

//
function playGame() {
  background(bgImg);
  
  //Add the groundSensor to detect the ground
  groundSensor.position.x = captainCanuck.x + 28;
  groundSensor.position.y = captainCanuck.y + captainCanuck.height;

  captainCanuck.onGround = groundSensor.overlap(walkable);
  
  //Detect collisions with the coins and enable the player to gain scores if touching coins
  captainCanuck.sprite.overlap(coins, (player, coin) => {
    coin.remove();
    score += 1;
    levelScore += 1; 
    coinSound.play();
  });
  
  //Check collisions with the spikes and restart current level is touching spikes
  captainCanuck.sprite.overlap(spikes, (player, spike) => {
    captainCanuck = new Player(0, 500, 70, 100);
  });

  //End current level when reaches the door
  captainCanuck.sprite.overlap(door, (player, doorSprite) => {
    showLevelEndScreen();
  });
  
  //Check if the player is on water and slow down when the player is on water
  captainCanuck.onWater = false;
  captainCanuck.sprite.overlap(walkable, (player, water) => {
    if (water.getAnimationLabel() === waterImg) {
      captainCanuck.onWater = true;
    }
  });

  captainCanuck.move();

  //Set up a camera to move with the player
  if (captainCanuck.x - cameraOffsetX > width / 2) {
    cameraOffsetX = captainCanuck.x - width / 2;
  }
  else if (captainCanuck.x - cameraOffsetX < width / 4) {
    cameraOffsetX = captainCanuck.x - width / 4;
  }

  push();
  translate(-cameraOffsetX, 0);

  captainCanuck.display();
  drawSprites();

  pop();

  fill(255);
  textSize(32);
  textAlign(RIGHT, TOP);
  text('Score: ' + score, width - 10, 10);
  text('Restarts: ' + (MAX_RESTARTS - restartCount), width - 10, 50); // Display remaining restarts
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
  //skipButton.hide(); 
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
  text(`1 It has 10 levels in total. Your goal is to get as many coins as possible.
2. Press “D” or “d” to restart, you have 3 chances in one level;
    if 3 chances are running out, the game will restart from level 1.
3. left arrow → move left
    right arrow → move right
    up arrow → move up
    down arrow → move down
4. Do NOT touch SPIKES or LAVAS, you would have to restart (evil face)
`, width / 2, height / 2 - 150);


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

  if (currentLevel >= TILE_MAPS.length) {
    TILE_MAPS.push(generateTileMap(8)); 
  }

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
  cameraOffsetX = 0;
  levelScore = 0; // Reset level score
  restartCount = 0; // Reset restart count for the level
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency
}

//Allow the player to restart current level
function restartLevel() {
  showingLevelEndScreen = false;
  nextLevelButton.hide();
  restartLevelButton.hide();

  score -= levelScore; // Deduct the level score from the total score
  levelScore = 0; // Reset level score

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

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
  cameraOffsetX = 0;
  showLevelText = true; // Show level text at the start
  levelTextAlpha = 255; // Reset the level text transparency
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

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
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

//Display the player and enable the player to move
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

    this.sprite.visible = false;
  }

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
      if (keyIsDown(LEFT_ARROW)) {
        this.speedX -= 1.2;
        this.facingRight = false;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.speedX += 1.2;
        this.facingRight = true;
      }
      if (keyIsDown(UP_ARROW) && this.onGround) {
        this.jump = true;
      }
      if (this.jump) {
        this.speedY = -10;
        this.jump = false;
        this.onGround = false;
      }
      else {
        this.player = playerImg1;
      }
      this.speedX *= 0.8;
    }

    this.speedX = constrain(this.speedX, -10, 10);

    this.y += this.speedY;
    this.x += this.speedX;

    if (this.y >= height - this.height / 2) {
      this.y = height - this.height / 2;
      this.onGround = true;
      this.player = playerImg1;
    }
    else {
      this.onGround = false;
    }

    this.sprite.position.x = this.x + this.player.width / 2;
    this.sprite.position.y = this.y + this.player.height;

    if (this.onWater) {
      this.speedX *= 0.1;
    }
  }

  display() { 
    let imgWidth = this.player === playerImg2 ? this.width * 1.8 : this.width;
    let imgHeight = this.player === playerImg2 ? this.height * 1.8 : this.height;

    push();
    translate(this.x + imgWidth / 2, this.y + imgHeight / 2);
    if (!this.facingRight) {
      scale(-1, 1);
    }
    imageMode(CENTER);
    image(this.player, 0, 0, imgWidth, imgHeight);
    pop();
  }
}

//Add diffferent sprites(tiles, spikes, coins...) to the map
function drawMap() {
  floortiles.removeSprites();
  walkable.removeSprites();
  walkable.clear();

  coins.removeSprites();
  coins.clear();

  spikes.removeSprites();
  spikes.clear();

  door.removeSprites();
  door.clear();

  let tileMap = TILE_MAPS[currentLevel];
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      if (tileMap[row][col] === 'f') {
        let floorTile = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        floorTile.addImage(floorTileImg);
        floorTile.scale = (TILE_SIZE * 2) / floorTileImg.width;
        floortiles.add(floorTile);

        let topCollision = createSprite(col * TILE_SIZE, row * TILE_SIZE - TILE_SIZE / 2, TILE_SIZE * 2, 10);
        topCollision.visible = false;
        walkable.add(topCollision);
      }

      if (tileMap[row][col] === 'b') {
        let blockSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        blockSprite.addImage(blockImg);
        blockSprite.scale = 2.5;
        floortiles.add(blockSprite);

        let blockCollision = createSprite(col * TILE_SIZE, row * TILE_SIZE - (blockSprite.height * 2.5) / 2, TILE_SIZE, 10);
        blockCollision.visible = false;
        walkable.add(blockCollision);
      }

      if (tileMap[row][col] === 'c') {
        let coin = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        coin.addImage(coinsImg);
        coin.scale = 0.3;
        coins.add(coin);
      }

      if (tileMap[row][col] === 's') {
        let spike = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        spike.addImage(spikesImg);
        spike.scale = 0.3;
        spikes.add(spike);
      }

      if (tileMap[row][col] === 'd') {
        let doorSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        doorSprite.addImage(doorImg);
        doorSprite.scale = 0.3;
        door.add(doorSprite);
      }

      if (tileMap[row][col] === 'p') {
        let platformSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        platformSprite.addImage(platformImg);
        walkable.add(platformSprite);
      }

      if (tileMap[row][col] === 'l') {
        let lavaSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        lavaSprite.addImage(lavaImg);
        lavaSprite.scale = 0.9;
        spikes.add(lavaSprite);
      }

      if (tileMap[row][col] === 'L') {
        let lava2Sprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        lava2Sprite.addImage(lava2Img);
        lava2Sprite.scale = 1;
        spikes.add(lava2Sprite);
      }

      if (tileMap[row][col] === 'w') {
        let waterSprite = createSprite(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        waterSprite.addImage(waterImg);
        waterSprite.scale = 2.5;
        walkable.add(waterSprite);
      }
    }
  }
}

//Draw tile maps for different levels and 
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
    'ppppppppppppppppppppppppppp',
    '...................',
    '...................'
  ],
  [ //Level 2
    '...................',
    '......................',
    '............d.........',
    '.........c..f.........',
    '...c..f..f............',
    '...f..................',
    '.....f.....cs.........',
    '........f..f..........',
    '.....f.s..............',
    'pppppppppppppppppppppppp',
    '......................',
    '......................'
  ],
  [ //Level 3
   '...................',
    '..................',
    '.................d..',
    '.................f..',
    '.............f.c...',
    '...............f...',
    '..........c..f.....',
    '.......c..f........',
    '...f.s.f........',
    'pppppppppppppppppppppppp',
    '................',
    '.................'
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
   '...................',
    '....................',
    '..d...................',
    '..f..c................',
    '.....f......c.........',
    '........f...f..c......',
    '...............f......',
    '..................f...',
    '.....s....s.f..f....c.',
    'ppppppppppppppppppppp',
    '....................',
    '....................'
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
  '.....................',
    '..................',
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
   '...................',
    '...................',
    '.......c....d......',
    '..... bbbLLbbb......',
    '...c.b.............',
    '..bbb...............',
    '.....bb..c.s........',
    '..c....bbbbb........',
    'bbbbbb..............',
    '....................',
    '....................',
    '....................'
  ],

  [ //Level 9
    '..................',
    '...................',
    '...................',
    '...................',
    '....................c.d',
    '..................sbbbb',
    '.c...bbwwbb..c..bbb...',
    'bbbb........bbb....',
    '...................',
    '...................',
    '...................'
  ],

  [ //Level 10
    '..................................',
    '..................................',
    '..................................',
    '.............c....................',
    '............bbbLbb..c............',
    '......c..bb.........bbb...c.......',
    '..s..bbb.................bb.....cd',
    'bbbbb.......................bbbLbb',
    '..................................',
    '..................................',
    '...................................'
  ],
  //generateTileMap(8)
];



