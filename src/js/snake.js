import { isValidKey } from '@jamesrock/rockjs';

class Food {
	constructor(x, y) {

		this.x = x;
		this.y = y;

	};
	color = 'grey';
};

class Segment {
	constructor(x, y) {

		this.x = x;
		this.y = y;

	};
	color = 'black'
};

class Snake {
	constructor() {

		this.node = document.createElement('div');
		this.scoreNode = document.createElement('div');
		this.gameOverNode = document.createElement('div');
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.node.classList.add('snake');
		this.scoreNode.classList.add('score');

		this.gameOverNode.classList.add('game-over');

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.node.appendChild(this.scoreNode);
		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.updateScore();

		const _this = this;

		this.gameOverNode.addEventListener('click', function() {
			_this.start();
		});

	};
	start() {

		this.reset();

		var
		snake = this,
		startLength = snake.size;

		for(var i = 0; i < startLength; i++) {
			snake.segments.push(new Segment(i, 0));
		};

		snake.createFood();

		snake.draw();

	};
	draw() {

		var
		snake = this;

		snake.canvas.width = snake.width;

		snake.segments.forEach(function(seg) {
			snake.ctx.fillStyle = seg.color;
			snake.ctx.fillRect(snake.inflate(seg.x), snake.inflate(seg.y), snake.size, snake.size);
		});
		
		snake.foods.forEach(function(food) {
			snake.ctx.fillStyle = food.color;
			snake.ctx.fillRect(snake.inflate(food.x), snake.inflate(food.y), snake.size, snake.size);
		});

		setTimeout(function() {
			snake.update();
		}, snake.speed - (snake.multiplier * snake.eaten));

	};
	update() {

		var 
		seg = this.segments[this.segments.length-1],
		x = seg.x,
		y = seg.y;

		switch(this.direction) {
			case directions.right:
				x ++;
			break;
			case directions.left:
				x --;
			break;
			case directions.down:
				y ++;
			break;
			case directions.up:
				y --;
			break;
		};

		if(this.checkCollision(x, y)) {
			this.gameOverNode.innerHTML = `GAME OVER<br />You scored ${snake.eaten}.<br />Tap to try again.`;
			this.setGameOverScreen('true');
			return;
		};

		this.checkFood(x, y);

	};
	checkCollision(x, y) {

		// log && console.log(`checkCollision(${x}, ${y})`);

		var 
		collision = false,
		snake = this,
		seg;

		for(var i = 1; i < snake.segments.length; i++) {
			seg = snake.segments[i];
			if(seg.x === x && seg.y === y) {
				collision = true;
			};
		};

		if((x === -1) || (y === -1) || (this.inflate(x) === this.width) || (this.inflate(y) === this.height)) {
			collision = true;
		};

		return collision;

	};
	checkFood(x, y) {

		var
		snake = this;

		snake.foods.forEach(function(food, i) {

			if(food.x === x && food.y === y) {
				
				snake.eaten ++;
				snake.segments.push(new Segment(food.x, food.y));

				snake.foods.splice(i, 1);
				snake.updateScore();

				return 'break';
				
			};

		});

		if(snake.foods.length === 0) {
			
			snake.createFood();

		};
		
		snake.move(x, y);

	};
	createFood() {

		const {
			x, y
		} = this.getRandomXAndY();

		this.foods.push(new Food(x, y));
		return this;

	};
	move(x, y) {

		// log && console.log(`move(${x}, ${y})`);
		
		var 
		snake = this,
		seg = snake.segments.shift();

		seg.x = x;
		seg.y = y;
		snake.segments.push(seg);

		snake.draw();

	};
	turn(direction) {

		// log && console.log(`snake.turn(${direction})`);

		if(!direction) {
			return;
		};

		if((this.direction != opposites[direction])) {
			this.direction = direction;
		};

		return this;

	};
	updateScore() {

		this.scoreNode.innerHTML = `score: ${this.eaten}`;
		return this;

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	reset() {
		
		this.eaten = 0;
		this.direction = directions.right;
		this.segments = [];
		this.foods = [];
		this.setGameOverScreen('false');
		this.updateScore();
		return this;

	};
	inflate(a) {
		
		return (a * this.size);

	};
	getRandom(max) {

		return Math.floor(Math.random() * ((max - this.size) / this.size));

	};
	getRandomXAndY() {

		let 
		x = this.getRandom(this.width),
		y = this.getRandom(this.height);

		while(this.checkForSegment(`${x}${y}`)) {
			x = this.getRandom(this.width);
			y = this.getRandom(this.height);
			log && console.log('segment clash');
		};

		return {
			x,
			y
		};

	};
	setGameOverScreen(visible) {

		this.gameOverNode.setAttribute('data-active', visible);
		return this;

	};
	checkForSegment(toCheck) {

		return this.segments.map((segment) => (`${segment.x}${segment.y}`)).some((value) => (toCheck===value));

	};
	width = 350;
	height = 450;
	size = 10;
	speed = 300;
	multiplier = 5;
	eaten = 0;
	direction = directions.right;
	segments = [];
	foods = [];
};

var 
body = document.body,
swipeThreshold = 30,
swipeThresholdInverse = (swipeThreshold*-1),
touchX,
touchY,
directions = {
	'left': 'left',
	'up': 'up',
	'right': 'right',
	'down': 'down'
},
directionsKeyMap = {
	'ArrowLeft': 'left',
	'ArrowUp': 'up',
	'ArrowRight': 'right',
	'ArrowDown': 'down'
},
opposites = {
	'left': 'right',
	'right': 'left',
	'up': 'down',
	'down': 'up'
},
directionsArray = Object.keys(directionsKeyMap),
log = true,
snake = new Snake();

snake.renderTo(body);

document.addEventListener('keydown', function(e) {
		
	if(isValidKey(e.key, directionsArray)) {
		return snake.turn(directionsKeyMap[e.key]);
	};

});

document.addEventListener('touchstart', function(e) {

	var
	firstTouch = e.touches[0];

	touchX = firstTouch.clientX;
	touchY = firstTouch.clientY;

});

document.addEventListener('touchmove', function(e) {

	var
	firstTouch = e.touches[0],
	touchXDiff = (firstTouch.clientX - touchX),
	touchYDiff = (firstTouch.clientY - touchY),
	direction;

	if((touchXDiff >= swipeThreshold)) {
		direction = directions.right;
	}
	else if((touchXDiff <= swipeThresholdInverse)) {
		direction = directions.left;
	}
	else if((touchYDiff >= swipeThreshold)) {
		direction = directions.down;
	}
	else if((touchYDiff <= swipeThresholdInverse)) {
		direction = directions.up;
	};

	snake.turn(direction);

});

snake.start();
