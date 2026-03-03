export const mapToGrid = (pixels, w) => {

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
