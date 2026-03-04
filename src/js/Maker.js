import {
  DisplayObject,
	makeArray,
	makeInput,
	makeNode,
	makeButton,
	makeSelect
} from '@jamesrock/rockjs';
import { mapToGrid } from './utils';
import { mazes } from './mazes';

const body = document.body;

const makeOpacitySlider = () => {
  const node = makeInput(0, 'range');
  node.min = 0;
  node.max = 1;
  node.step = 0.1;
  node.value = 1;
  return node;
};

class Grid extends DisplayObject {
  constructor(s, w, h, data = makeArray(w*h, () => 0)) {

    super();

    this.size = s;
    this.width = w;
    this.height = h;
    this.data = data;
    this.grid = mapToGrid(this.data, this.width);
    this.map = this.grid.map(([type, x, y]) => `x${x}y${y}`);

    let x = 0;
    let y = 0;
    const gap = 1;
    const node = this.node = makeNode('div', 'grid');
    node.style.width = `${w*s+(gap*(w-1))}px`;
    node.style.height = `${h*s+(gap*(h-1))}px`;
    node.style.gap = `${gap}px`;

    const drawPixels = () => {

      makeArray(w*h).forEach((index) => {
        const pixel = makeNode('div', 'grid-pixel');
        pixel.style.width = pixel.style.height = `${s}px`;
        pixel.dataset.index = index;
        pixel.dataset.x = x;
        pixel.dataset.y = y;
        pixel.dataset.state === 'empty';
        pixel.classList.add(this.guides.includes(x) || this.guides.includes(y) ? 'guide' : 'pixel');
        node.append(pixel);
        this.pixels.push(pixel);

        if(x > 0 && x%(w-1)===0) {
          x = 0;
          y ++;
        }
        else {
          x ++;
        };

      });

    };

    const drawGuides = () => {

      const xPixels = (w-1)/3;
      const yPixels = (h-1)/3;
      const combined = ((xPixels*yPixels)*4);

      makeArray((w*h) - combined).forEach(() => {

        const pixel = makeNode('div', 'grid-pixel');
        pixel.style.width = pixel.style.height = `${s}px`;
        pixel.dataset.x = x;
        pixel.dataset.y = y;
        pixel.dataset.state === 'empty';
        const isYGuide = this.guides.includes(y);
        pixel.classList.add('guide');
        pixel.style.position = 'absolute';
        pixel.style.left = `${x*s+(x+1)}px`;
        pixel.style.top = `${y*s+(y+1)}px`;
        node.append(pixel);
        this.pixels.push(pixel);

        if(x > 0 && x%(w-1)===0) {
          x = 0;
          y ++;
        }
        else {
          x += isYGuide ? 1 : 3;
        };

      });

    };

    // drawPixels();
    drawGuides();

    this.fill();

    console.log(this);

  };
  fill() {

    this.grid.filter(([type]) => type>0).forEach(([type, x, y]) => {
      this.get(x, y).dataset.state = this.stateAttributeMap[type];
    });

    return this;

  };
  set(x, y, value) {

    const dataIndex = this.map.indexOf(`x${x}y${y}`);
    this.data[dataIndex] = this.stateDataMap[value];
    this.get(x, y).dataset.state = this.stateAttributeMap[this.data[dataIndex]];
    return this;

  };
  get(x, y) {

    return this.node.querySelector([`[data-x="${x}"][data-y="${y}"]`]);

  };
  stateDataMap = {
    'wall-yes': 1,
    'wall-no': 0,
    'door-yes': 2,
    'door-no': 0
  };
  stateAttributeMap = ['empty', 'wall', 'door'];
  guides = makeArray(55).map((value) => value * 3);
  pixels = [];
};

export class Maker {
  constructor() {

    const settings = {
      '100': {
        xPos: 3,
        yPos: 38,
        size: 1476,
        pixelSize: 20,
        width: 37,
        height: 49
      },
      '200': {
        xPos: 3,
        yPos: 37,
        size: 1406,
        pixelSize: 15,
        width: 46,
        height: 61
      },
      '300': {
        xPos: 4,
        yPos: 36,
        size: 1370,
        pixelSize: 12,
        width: 55,
        height: 73
      },
      '400': {
        xPos: 4,
        yPos: 37,
        size: 1398,
        pixelSize: 10,
        width: 67,
        height: 88
      },
      '500': {
        xPos: 4,
        yPos: 34,
        size: 1306,
        pixelSize: 8,
        width: 76,
        height: 100
      },
      '600': {
        xPos: 4,
        yPos: 34,
        size: 1300,
        pixelSize: 7,
        width: 85,
        height: 112
      },
    };

    const maker = makeNode('div', 'maker');
    const inputs = makeNode('div', 'inputs');
    const inputsTop = makeNode('div', 'inputs-top');
    const inputsBottom = makeNode('div', 'inputs-bottom');
    const target = makeNode('div', 'grid-target');
    const difficulty = makeSelect(Object.keys(settings).map((a) => [a, a]));
    const mode = makeSelect([['add wall', 'wall-yes'], ['remove wall', 'wall-no'], ['add door', 'door-yes'], ['remove door', 'door-no']]);
    const constrain = {
      'wall-yes': 'guide',
      'wall-no': 'guide',
      'door-yes': 'guide',
      'door-no': 'guide'
    };
    const set = makeSelect(makeArray(10).map((a) => [`#${a + 1}`, a]));
    const copyButton = makeButton('copy', 'copy');
    let props = settings[difficulty.value];
    const xPos = makeInput(props.xPos);
    const yPos = makeInput(props.yPos);
    const size = makeInput(props.size);
    const pixelSize = makeInput(props.pixelSize);
    const width = makeInput(props.width);
    const height = makeInput(props.height);
    const opacity = makeOpacitySlider();
    let grid = null;

    size.step = 2;

    const changeHandler = () => {
      body.style.backgroundImage = `url(/mazes/maze-${Number(set.value) + 1}-${difficulty.value}.png)`;
      body.style.backgroundSize = `${size.value}px`;
      body.style.backgroundPosition = `calc(50% - ${xPos.value}px) calc(50% - ${yPos.value}px)`;
      if(grid) {
        grid.destroy();
      };
      grid = new Grid(Number(pixelSize.value), Number(width.value), Number(height.value), mazes[`d${difficulty.value}`][set.value]);
      grid.appendTo(target);
    };

    difficulty.addEventListener('input', () => {
      props = settings[difficulty.value];
      xPos.value = props.xPos;
      yPos.value = props.yPos;
      size.value = props.size;
      pixelSize.value = props.pixelSize;
      width.value = props.width;
      height.value = props.height;
      changeHandler();
    });

    set.addEventListener('input', changeHandler);

    opacity.addEventListener('input', () => {
      target.style.opacity = opacity.value;
    });

    [set, difficulty, mode, copyButton, opacity].forEach((input) => {
      inputsTop.append(input);
    });

    [xPos, yPos, size, pixelSize, width, height].forEach((input) => {
      input.addEventListener('input', changeHandler);
      inputsBottom.append(input);
    });

    inputs.append(inputsTop);
    // inputs.append(inputsBottom);

    maker.append(target);
    maker.append(inputs);
    body.append(maker);

    changeHandler();

    let knobs = null;

    target.addEventListener('touchstart', (e) => {
      knobs = [];
    });

    target.addEventListener('touchmove', (e) => {
     	const knob = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
     	if(knob?.classList.contains(constrain[mode.value])) {
    		if(knobs.indexOf(knob)===-1) {
     			knobs.push(knob);
          grid.set(knob.dataset.x, knob.dataset.y, mode.value);
    		};
     	};
     	e.preventDefault();
    });

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(grid.data));
      copyButton.innerText = 'copied!';
      setTimeout(() => {
        copyButton.innerText = 'copy';
      }, 2000);
    });

  };
};
