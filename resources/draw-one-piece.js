/*
A simple test: SVG paths for a single jigsaw puzzle piece
*/

const {jigsawSide, getScale} = require('./jigsawSide.js');

let str = "";
str += jigsawSide({x0:0,y0:0,x1:30,y1:0, flip:1});
str += jigsawSide({x0:30,y0:0,x1:30,y1:30, flip:-1});
str += jigsawSide({x0:30,y0:30,x1:0,y1:30, flip:1});
str += jigsawSide({x0:0,y0:30,x1:0,y1:0, flip:1});

console.log(str);
