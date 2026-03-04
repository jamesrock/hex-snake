import '/css/app.css';
import {
	Rounder,
	Scaler,
	GameBase,
	setDocumentHeight,
	isValidKey,
	makeArray,
	random,
	getRandom,
	makeNode,
	getLast,
	floorTo
} from '@jamesrock/rockjs';
import { Maker } from './Maker';
import { mazes } from './mazes';
import { mapToGrid } from './utils';

// console.log(mazes);

setDocumentHeight();

const scaler = new Scaler(2);

class SoundManager {
  constructor(url) {

    this.sounds = makeArray(10, () => makeAudio(url));

  };
  play() {

    this.sounds[this.index].play();

    if(this.index<this.sounds.length-1) {
      this.index ++;
    }
    else {
      this.index = 0;
    };

  };
  index = 0;
};

const makeAudio = (url) => {
  const audio = new Audio(url);
  audio.preload = true;
  return audio;
};

const makeCoins = (w, h) => {
  let x = 4;
  let y = 1;
  const limit = ((w-1)/3);
  const rows = ((h-1)/3);
  return makeArray((limit*rows)-1).map((index) => {

    const coin = new Coin(x, y);

    if(x > 0 && x%(w-3) === 0) {
      x = 1;
      y += 3;
    }
    else {
      x += 3;
    };

    return coin;

  });
};

class Wall {
	constructor(x, y, color = 'deeppink') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Coin {
	constructor(x, y, color = 'white') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Man {
	constructor(x, y, color = 'white') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Door {
	constructor(x, y, color = 'deeppink') {

		this.x = x;
		this.y = y;
		this.color = color;
		this.open = false;

	};
};

class Maze extends GameBase {
	constructor(data, mode = '100') {

		super('maze');

		this.settings = {
      '100': {
        pixelSize: 15,
        width: 37,
        height: 49
      },
      '200': {
        pixelSize: 12,
        width: 46,
        height: 61
      },
      '300': {
        pixelSize: 10,
        width: 55,
        height: 73
      },
      '400': {
        pixelSize: 10,
        width: 55,
        height: 73
      },
      '500': {
        pixelSize: 15,
        width: 37,
        height: 49
      },
      '600': {
        pixelSize: 12,
        width: 46,
        height: 61
      },
    };

		this.mode = mode;
		this.props = this.settings[this.mode];

		this.width = this.props.width;
		this.height = this.props.height;
		this.size = scaler.inflate(40);
		// this.size = scaler.inflate(10);
		this.data = data;
		this.grid = mapToGrid(data, this.props.width);
		this.walls = this.grid.filter(([type]) => type===1).map(([type, x, y]) => new Wall(x, y));
		this.doors = this.grid.filter(([type]) => type===2).map(([type, x, y]) => new Door(x, y));
		this.coins = makeCoins(this.props.width, this.props.height);
		this.sounds = new SoundManager('/audio/point.mp3');
		this.countCount = this.coins.length;

		this.canvas.width = scaler.inflate(window.innerWidth);
		this.canvas.height = scaler.inflate(window.innerHeight);
		this.canvas.style.width = `${scaler.deflate(this.canvas.width)}px`;

		this.scoreNode = makeNode('div', 'stats');

		this.node.appendChild(this.canvas);
		this.node.appendChild(this.scoreNode);
		this.node.appendChild(this.gameOverNode);

		this.showGameOverScreen();
		this.reset();
		this.render();
		this.updateScore();

		console.log(this);

	};
	render() {

		// this.canvas.width = this.inflate(this.width);
		this.canvas.width = scaler.inflate(window.innerWidth);

		// this.ctx.fillStyle = '#222';
		// this.ctx.fillRect(this.inflate(this.x), this.inflate(this.y), this.inflate(this.width), this.inflate(this.height));

		this.walls.forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.inflate(x + this.x), this.inflate(y + this.y), this.size, this.size);
		});

		this.doors.filter((door) => !door.open).forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.inflate(x + this.x), this.inflate(y + this.y), this.size, this.size);
		});

		this.coins.forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.beginPath();
      this.ctx.arc(this.inflate((x + 1) + this.x), this.inflate((y + 1) + this.y), this.size*0.6, 0, 2 * Math.PI);
      this.ctx.fill();
		});

		this.men.forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.inflate(x), this.inflate(y), this.size*2, this.size*2);
		});

		// this.animationFrame = requestAnimationFrame(() => {
		// 	this.render();
		// });

		return this;

	};
	reset() {

		const onePixel = scaler.deflate(this.size);
		const numberOfXPixels = floorTo(window.innerWidth / onePixel);
		const numberOfYPixels = floorTo(window.innerHeight / onePixel);

		this.x = floorTo((numberOfXPixels / 2) - 2);
		this.y = floorTo((numberOfYPixels / 2) - 4);

		// this.x = 20;
		// this.y = 20;

		this.men = [new Man(this.x + 1, this.y + 1)];
		this.score = 0;
		this.gameOver = false;

		this.gameOverNode.dataset.active = false;

		return this;

	};
	checkCoins() {

		const coin = this.coins.find((c) => (c.x + this.x) === (this.men[0].x) && (c.y + this.y) === (this.men[0].y));

		if(coin) {

			this.coins.splice(this.coins.indexOf(coin), 1);
			// coin.color = 'magenta';
			this.score ++;

			this.sounds.play();

			if(this.coins.length === 0) {
			  this.doors.forEach((door) => {
					door.open = true;
				});
			};

			this.updateScore();

		};

		return false;

	};
	move(direction) {

	  if(!this.canMove(direction)) {
			return;
		};

		switch(direction) {
      case 'up':
        this.y ++;
      break;
      case 'down':
        this.y --;
      break;
      case 'left':
        this.x ++;
      break;
      case 'right':
        this.x --;
      break;
		};

		this.checkCoins();
		this.render();

		return this;

	};
	canMove(direction) {

    let {x, y} = this.men[0];

    switch(direction) {
      case 'up':
        y --;
      break;
      case 'down':
        y ++;
      break;
      case 'left':
        x --;
      break;
      case 'right':
        x ++;
      break;
		};

		const queries = [
     	`x${x}y${y}`, // top left
     	`x${x+1}y${y}`, // top right
     	`x${x}y${y+1}`, // bottom right
     	`x${x+1}y${y+1}`, // bottom left
    ];

    return !queries.map((q) => this.checkForWall(q)).includes(true) && !queries.map((q) => this.checkForDoor(q)).includes(true);

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	inflate(a) {

		return (a * this.size);

	};
	checkForWall(q) {

		return this.walls.map((wall) => (`x${wall.x+this.x}y${wall.y+this.y}`)).includes(q);

	};
	checkForDoor(q) {

		return this.doors.filter((door) => !door.open).map((door) => (`x${door.x+this.x}y${door.y+this.y}`)).includes(q);

	};
	stop() {

		cancelAnimationFrame(this.animationFrame);
		return this;

	};
	updateScore() {

	  // this.scoreNode.innerHTML = `${this.score}/${this.countCount}`;
		return this;

	};
};

const
body = document.body,
directionsKeyMap = {
	ArrowLeft: 'left',
	ArrowUp: 'up',
	ArrowRight: 'right',
	ArrowDown: 'down'
},
directionsArray = Object.keys(directionsKeyMap),
rounder = new Rounder(30),
mode = '300',
snake = window.snake = new Maze(getLast(mazes[`d${mode}`]), mode);

let touch = null;
let xMovement = 0;
let yMovement = 0;

document.addEventListener('keydown', (e) => {

	if(isValidKey(e.code, directionsArray)) {
		snake.move(directionsKeyMap[e.key]);
	};

	if(snake.gameOver && isValidKey(e.code, ['Space'])) {
		snake.reset();
	};

});

document.addEventListener('click', () => {

	if(snake.gameOver) {
		snake.reset();
	};

});

document.addEventListener('touchstart', (e) => {

  touch = e.touches[0];
  xMovement = 0;
	yMovement = 0;

	e.preventDefault();

});

document.addEventListener('touchmove', (e) => {

	const {clientX: originalClientX, clientY: originalClientY} = touch;
	const {clientX, clientY} = e.touches[0];
	const x = rounder.round(clientX - originalClientX);
	const y = rounder.round(clientY - originalClientY);

	if(x !== xMovement) {
		document.dispatchEvent(new Event(x > xMovement ? 'drag-right' : 'drag-left'));
	};

	if(y !== yMovement) {
		document.dispatchEvent(new Event(y > yMovement ? 'drag-down' : 'drag-up'));
	};

	xMovement = x;
	yMovement = y;

});

document.addEventListener('drag-up', () => {

	snake.move('up');

});

document.addEventListener('drag-down', () => {

	snake.move('down');

});

document.addEventListener('drag-right', () => {

	snake.move('right');

});

document.addEventListener('drag-left', () => {

	snake.move('left');

});

snake.renderTo(body);
// window.maker = new Maker();
