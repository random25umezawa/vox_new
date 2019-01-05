const fs = require("fs")
const Vox = require("./voxtool.js")
const Vox2D = require("./vox2d.js")

let vx = new Vox(fs.readFileSync("./reftestvox.vox"));
let v2d = new Vox2D(vx);
//console.log(vx.chunk);
//console.log(JSON.stringify(vx.chunk,null,"\t"))
let merged = v2d.getRootModel();
let size = merged[1];
let blocks = merged[2];
let y_tiles = {};
for(let block of merged[2]) {
	if(!y_tiles[block[1]]) y_tiles[block[1]] = [];
	y_tiles[block[1]].push(block);
}
console.log(y_tiles);
