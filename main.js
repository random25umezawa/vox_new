const fs = require("fs")
const Vox = require("./voxtool.js")

let vx = new Vox(fs.readFileSync("./reftestvox.vox"));
//console.log(vx.chunk);
//console.log(JSON.stringify(vx.chunk,null,"\t"))
let merged = vx.getModel(vx.nodes[0]);
let y_tiles = {};
for(let block of merged[2]) {
	if(!y_tiles[block[1]]) y_tiles[block[1]] = [];
	y_tiles[block[1]].push(block);
}
console.log(y_tiles);
