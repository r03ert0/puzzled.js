
/**
 * @description Scale of the drawings: all dimensions are multiplied by this factor
 */
let SCALE = 4;

/**
 * @description Size of the head of each puzzle size: The round bit that locks
 * the pieces together. This value can't be changed.
 */
const HEAD = 5;

/**
 * @function getScale
 * @description Get the global scale of the drawings
 * @param none
 * @returns {number} The scale
 */
export const getScale = () => SCALE;

/**
 * @function setScale
 * @description Set the global scale
 * @param {number} scale The new global scale
 * @returns {none}
 */
export const setScale = (scale) => {SCALE = scale};

/**
 * @function jigsawSide
 * @description Creates an SVG path string drawing a jigsaw side from the start point
 * to the end point, eventually flipping the position of the head.
 * @param {number} x0 Start point, x coordinate
 * @param {number} y0 Start point, y coordinate
 * @param {number} x1 End point, x coordinate
 * @param {number} y1 End point, y coordinate
 * @param {number} flip Whether to flip or not the position of the head, values are -1 or 1.
 * @returns {string} An SVG path element for the jigsaw side
 */
 export const jigsawSide =({x0, y0, x1, y1, flip}) => {
    const width = Math.sqrt((x1-x0)**2 + (y1-y0)**2);
    const angle = Math.atan2(y1-y0,x1-x0)*180/Math.PI;
    const arm = (width-HEAD)/2;
    const dx = [3,arm-1,arm, 1,-2,-2, 0,9,9, 0,-3,-2, 1,arm-3,arm];
    const dy = [1,3,1, -2,-3,-6, -3,-3,0, 3,4,6, 2,0,-1];
    const fx = (j) => px+dx[3*i + j];
    const fy = (j) => py+dy[3*i + j]*flip;
    let i, px = 0, py = 0;
    let [x, y] = [x0, y0];

    const ca = Math.cos(angle*Math.PI/180), sa = Math.sin(angle*Math.PI/180);
    const mat = [[ca, -sa], [sa, ca]];
    const matvec = (vx, vy) => [
        Math.round(100*SCALE*(mat[0][0]*vx + mat[0][1]*vy + x))/100,
        Math.round(100*SCALE*(mat[1][0]*vx + mat[1][1]*vy + y))/100
    ];

    let tmp = matvec(px, py);
    let str = `M${tmp[0]},${tmp[1]} C`;
    for(i=0;i<5;i++) {
        tmp = matvec(fx(0), fy(0));
        str += `${tmp[0]},${tmp[1]} `;
        tmp = matvec(fx(1), fy(1));
        str += `${tmp[0]},${tmp[1]} `;
        tmp = matvec(fx(2), fy(2));
        str += `${tmp[0]},${tmp[1]} `;
        px += dx[3*i + 2];
        py += dy[3*i + 2] * flip;
    }
    str += " ";

    return str;
};

export const straightSide = ({x0, y0, x1, y1}) => {
    // let str = `<path transform="scale(${SCALE})" stroke-width=${1/SCALE} fill="none" stroke="red" `;
    // str += `d="M${x0},${y0} L${x1},${y1}"`;
    // str += `/>\n`;
    return `M${SCALE*x0},${SCALE*y0} L${SCALE*x1},${SCALE*y1} `;
};

export const reverseBezier = (tmp) => {
    const ta = [];
    ta[0] = "M" + tmp.pop();
    ta[1] = "C" + tmp.pop();
    let pmt = tmp.reverse();
    ta.push(...pmt);
    ta[14] = ta[14].replace("C", "");
    ta[15] = ta[15].replace("M", "");
    return ta.join(" ");
};

export const reverseLine = (tmp) => {
    return [
        tmp[1].replace("L", "M"),
        tmp[0].replace("M", "L")
    ].join(" ");
};

export const reversePath = (s) => {
    let tmp = s.trim().split(" ");
    let result;
    if (tmp.length === 2) {
        result = reverseLine(tmp);
    } else {
        result = reverseBezier(tmp);
    }
    return result;
}

export const puzzleSides = (rows, columns, rand) => {
    // compute the grid of corners of all pieces
    const arr = [];
    for(let a = 0; a<=columns; a++) {
        arr[a] = [];
        for(let b = 0;b<=rows; b++) {
            const x = 25*a + (a>0 && a<columns-1)*Math.random()*rand;
            const y = 25*b + (b>0 && b<rows-1)*Math.random()*rand;
            arr[a][b] = [x, y];
        }
    }

    // draw all sides
    const sides = [];
    for (let a=0; a<arr.length; a++) {
        sides[a] = [];
        for (let b=0;b<arr[a].length; b++) {
            sides[a][b] = [];
        }
    }

    // draw horizontal straight sides
    for(let a = 0; a < arr.length-1; a++) {
        for(let b = 0; b < arr[a].length; b+=arr[a].length-1) {
            const [x0, y0] = arr[a][b];
            const [x1, y1] = arr[a+1][b];
            sides[a][b] = [straightSide({x0:x0, y0:y0, x1:x1, y1:y1})];
        }
    }

    // draw vertical straight sides
    for(let a = 0; a < arr.length; a+=arr.length-1) {
        for(let b = 0; b<arr[a].length-1; b++) {
            const [x0, y0] = arr[a][b];
            const [x1, y1]= arr[a][b+1];
            sides[a][b][1] = straightSide({x0:x0, y0:y0, x1:x1, y1:y1});
        }
    }

    // draw the horizontal jigsaw sides
    for(let a = 0; a < arr.length-1; a++) {
        for(let b = 1; b<arr[a].length-1; b++) {
            const [x0, y0] = arr[a][b];
            const [x1, y1] = arr[a+1][b];
            const flip = (Math.random()>0.5)?1:(-1);
            sides[a][b][0] = jigsawSide({x0:x0, y0:y0, x1:x1, y1:y1, flip:flip});
        }
    }

    // draw the vertical jigsaw sides
    for(let a = 1; a < arr.length-1; a++) {
        for(let b = 0; b<arr[a].length-1; b++) {
            const [x0, y0] = arr[a][b];
            const [x1, y1]= arr[a][b+1];
            const flip = (Math.random()>0.5)?1:(-1);
            sides[a][b][1] = jigsawSide({x0:x0, y0:y0, x1:x1, y1:y1, flip:flip});
        }
    }
    
    return sides;
};

export const puzzlePieceBezier = (sides, i, j) => {
    let d = sides[i][j][0];
    d += sides[i+1][j][1].replace(/M[^ ]* /,"");
    d += reversePath(sides[i][j+1][0]).replace(/M[^ ]* /,"");
    d += reversePath(sides[i][j][1]).replace(/M[^ ]* /,"");
    return d;
};
