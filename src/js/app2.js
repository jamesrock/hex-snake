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

setDocumentHeight();

const scaler = new Scaler(2);

const mapToGrid = (pixels, w) => {
  let x = 0;
  let y = 0;
  return pixels.map((a, index) => {

    const bob = [a, x, y, index];

    if(x > 0 && x%(w-1)===0) {
      x = 0;
      y ++;
    }
    else {
      x ++;
    };

    return bob;

  });
};

const makeCoins = (w, h) => {
  let x = 1;
  let y = 1;
  const limit = ((w-1)/3);
  const rows = ((h-1)/3);
  return makeArray(limit*rows).map((index) => {

    const coin = new Coin(x, y);

    if(x > 0 && x%(w-3)===0) {
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
	constructor(x, y, color = 'black') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Coin {
	constructor(x, y, color = 'red') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Maze extends GameBase {
	constructor(data, mode = 'easy') {

		super('maze');

		this.settings = {
      'easy': {
        pixelSize: 15,
        width: 37,
        height: 49
      },
      'medium': {
        pixelSize: 12,
        width: 46,
        height: 61
      },
      'hard': {
        pixelSize: 10,
        width: 55,
        height: 73
      },
    };

		this.mode = mode;
		this.props = this.settings[this.mode];

		this.width = this.props.width;
		this.height = this.props.height;
		// this.size = scaler.inflate(targetWidth / this.props.width);
		this.size = scaler.inflate(50);

		const grid = mapToGrid(data, this.props.width);

		this.data = data;
		this.walls = grid.filter((a) => a[0]===1).map(([isWall, x, y]) => new Wall(x, y));
		// this.coins = grid.filter((a) => a[0]===2).map(([isWall, x, y]) => new Coin(x, y));
		this.coins = makeCoins(this.props.width, this.props.height);
		this.countCount = this.coins.length;

		// this.canvas.width = this.inflate(this.width);
		this.canvas.width = scaler.inflate(window.innerWidth);
		// this.canvas.height = this.inflate(this.height);
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

		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(this.inflate(this.x), this.inflate(this.y), this.inflate(this.width), this.inflate(this.height));

		this.walls.forEach((seg) => {
			this.ctx.fillStyle = seg.color;
			this.ctx.fillRect(this.inflate(seg.x + this.x), this.inflate(seg.y + this.y), this.size, this.size);
		});

		this.coins.forEach((coin) => {
			this.ctx.fillStyle = coin.color;
			this.ctx.beginPath();
      this.ctx.arc(this.inflate((coin.x + 1) + this.x), this.inflate((coin.y + 1) + this.y), this.size-20, 0, 2 * Math.PI);
      this.ctx.fill();
			// this.ctx.fillRect(this.inflate(coin.x + this.x), this.inflate(coin.y + this.y), this.size, this.size);
		});

		this.toSquare().forEach(([x, y]) => {
			this.ctx.fillStyle = 'magenta';
			this.ctx.fillRect(this.inflate(x), this.inflate(y), this.size, this.size);
		});

		this.animationFrame = requestAnimationFrame(() => {
			this.render();
		});

		return this;

	};
	reset() {

		const onePixel = scaler.deflate(this.size);
		const numberOfXPixels = (window.innerWidth / onePixel);
		const numberOfYPixels = (window.innerHeight / onePixel);

		this.x = floorTo((numberOfXPixels / 2) - 1);
		this.y = floorTo((numberOfYPixels / 2) - 1);

		// this.x = 20;
		// this.y = 20;

		this.manX = (this.x + 2);
		this.manY = (this.y - 2);
		this.score = 0;
		this.colors = [
			'#F8C800', // yellow
			'#EF0040', // red
			'#FF00FF', // pink
			'#00E000', // green
			'#9C00FF', // purple
			'#25CCFD', // blue
			'#FF7F00', // orange
		];
		this.gameOver = false;

		this.gameOverNode.dataset.active = false;

		return this;

	};
	toSquare() {

		const x = this.manX;
		const y = this.manY;

	  return [
			[x-1, y-1],
			[x-1, y],
			[x, y-1],
			[x, y]
		];

	};
	checkCoins() {

		const coin = this.coins.find((c) => (c.x + this.x) === (this.manX - 1) && (c.y + this.y) === (this.manY - 1));

		if(coin) {

			this.coins.splice(this.coins.indexOf(coin), 1);
			this.score ++;

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

		return this;

	};
	canMove(direction) {

    let x = this.manX;
    let y = this.manY;

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

    return ![
			`x${x-1}y${y-1}`,
			`x${x-1}y${y}`,
			`x${x}y${y-1}`,
			`x${x}y${y}`,
		].map((q) => this.checkForWall(q)).includes(true);

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
rounder = new Rounder(20),
mode = 'hard',
snake = window.snake = new Maze(getLast(mazes[mode]), mode);

let touch = null;
let xMovement = 0;
let yMovement = 0;

snake.renderTo(body);

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

// window.maker = new Maker();
