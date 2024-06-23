let captainCanuck, groundSensor, coins, spikes, door;
let walkable, floortiles;
let playerImg1, playerImg2, floorTileImg, bgImg, coinsImg, platformImg, spikesImg, doorImg, lavaImg, lava2Img, blockImg, waterImg;
let backgroundMusic, coinSound;
const TILE_SIZE = 100;
let currentLevel = 0;
let score = 0;
let skipButton, startGameButton, gameInfoButton;
let cameraOffsetX = 0;
let gameStarted = false;

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
} 

function setup() {
  createCanvas(windowWidth, windowHeight);

  startGameButton = createButton('Start Game');
  startGameButton.position(width / 2 - 100, height / 2 - 20);
  startGameButton.mousePressed(startGame);

  gameInfoButton = createButton('GameInfo');
  gameInfoButton.position(width / 2 - 100, height / 2 + 20);

  startGameButton.hide();
  gameInfoButton.hide();

  captainCanuck = new Player(0, 500, 70, 100);

  groundSensor = createSprite(captainCanuck.x, captainCanuck.y + captainCanuck.height / 2, captainCanuck.width * 0.8, 5);
  groundSensor.visible = false;
  groundSensor.mass = 0.1;

  walkable = new Group();
  floortiles = new Group();
  coins = new Group();
  spikes = new Group();
  door = new Group();

  skipButton = createButton('Skip');
  skipButton.position(10, 10);
  skipButton.mousePressed(skipLevel);
  skipButton.hide();

  showStartingScreen();
}

function draw() {
  if (!gameStarted) {
    showStartingScreen();
  } else {
    playGame();
  }
}

function showStartingScreen() {
  background(bgImg);
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text('Game name', width / 2, height / 2 - 100);

  startGameButton.show();
  gameInfoButton.show();
}

function startGame() {
  gameStarted = true;
  startGameButton.hide();
  gameInfoButton.hide();
  skipButton.show();
  drawMap();

  captainCanuck = new Player(0, 500, 70, 100);
}

function playGame() {
  background(bgImg);

  groundSensor.position.x = captainCanuck.x + 28;
  groundSensor.position.y = captainCanuck.y + captainCanuck.height;

  captainCanuck.onGround = groundSensor.overlap(walkable);

  captainCanuck.sprite.overlap(coins, (player, coin) => {
    coin.remove();
    score += 1;
    coinSound.play();
  });

  captainCanuck.sprite.overlap(spikes, (player, spike) => {
    captainCanuck = new Player(0, 500, 70, 100);
  });

  captainCanuck.sprite.overlap(door, (player, doorSprite) => {
    nextLevel();
  });

  captainCanuck.onWater = false;
  captainCanuck.sprite.overlap(walkable, (player, water) => {
    if (water.getAnimationLabel() === waterImg) {
      captainCanuck.onWater = true;
    }
  });

  captainCanuck.move();

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
}

function nextLevel() {
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

  if (currentLevel >= 10 && !TILE_MAPS[currentLevel]) {
    TILE_MAPS[currentLevel] = generateTileMap(4);
  }

  drawMap();
  captainCanuck = new Player(0, 100, 70, 100);
  cameraOffsetX = 0;
}

function skipLevel() {
  nextLevel();
}

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


const TILE_MAPS = [
 [ //Level 1
   //'................',
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
   //'................',
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
    //'................',
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


  [ //level 4
      //'................',
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
      //'................',
      '....................',
      'd...................',
      'f..c................',
      '...f......c.........',
      '......f...f..c......',
      '.............f......',
      '................f...',
      '...s....s.f..f....c.',
     'ppppppppppppppppppppp',
      '....................',
      '....................'
  ],

  [ //Level 6
    //'..................',
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
    //'................',
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
    //'...................',
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
   // '................',
    '..................',
    '...................',
    '...................',
    '...................',
    '...................',
    '...................',
    '.c...bbwwbb........',
    'bbbb...............',
    '...................',
    '...................',
    '...................'
  ],


  [ //Level 10
   // '................',
    '..................................',
    '..................................',
    '..................................',
    '.............c....................',
    '............bbbLLbb..c............',
    '......c..bb.........bbb...c.......',
    '..s..bbb.................bb.....cd',
    'bbbb........................bbbLbb',
    '..................................',
    '..................................',
    '...................................'
  ],


 //  [
 //   // '................',
 //    '..................',
 //    '...................',
 //    '...................',
 //    '...................',
 //    '...................',
 //    '...................',
 //    '...................',
 //    '....s..............',
 //  'pppppppppppppppppppppppp',
 //    '................',
 //    '.................'
 //  ],
];


function initGame() {
 drawMap();
 captainCanuck = new Player(0, 100, 70, 100);
}


initGame();