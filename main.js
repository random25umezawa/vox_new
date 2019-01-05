const fs = require("fs")
const Vox = require("./voxtool.js")

let vx = new Vox(fs.readFileSync("./reftestvox.vox"));
console.log(vx);
console.log(JSON.stringify(vx,null,"\t"))
