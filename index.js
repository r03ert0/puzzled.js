import {getScale, puzzleSides, puzzlePieceBezier} from './jigsaw.js';

// get puzzle scale
const scale = getScale();

const run = async () => {
    // set number of rows and columns
    const rows = document.getElementById("nrows").value|0;
    const columns = document.getElementById("ncols").value|0;
    console.log(`Making a puzzle with ${rows} rows and ${columns} columns`);

    // randomness factor
    const rand = parseFloat(document.getElementById("rand").value);

    // add the picture
    const img = new Image;
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = "kitten.jpg";
    });
    const width = 1000;

    // draw the border
    const scaleX = width/(scale*25*columns);
    const scaleY = scaleX*(img.height/img.width)*columns/rows;

    const sides = puzzleSides(rows, columns, rand);
    window.sides = sides;

    // make svg
    let svg = `<image href="kitten.jpg" x="0" y="0" width="${width}px" />`;
    svg += `<g transform="scale(${scaleX} ${scaleY})">`
    for(let i=0;i<rows;i++) {
        for(let j=0;j<columns;j++) {
            svg += `<path stroke-width=${
                1/Math.sqrt(scaleX*scaleY)
            } fill="rgba(255,255,0,0.5)" stroke="black" d="${
                puzzlePieceBezier(sides, i, j)
            }"/>\n`;
        }
    }
    svg += "</g>";

    document.getElementById("view").innerHTML = svg;

}

const download = function () {
    const svgData = document.getElementById("view").outerHTML;
    const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "puzzle.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

window.download = download;
window.run = run;

run();