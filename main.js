const fs = require("fs")
const Jimp = require("jimp")
const VoxReader = require("./vox_reader.js")
const VoxMerge = require("./vox_merge.js")
const VoxExport = require("./vox_export.js")

if(process.argv.length<4) {
	console.log("too less args.");
	process.exit(0);
}

let file_in = process.argv[2];
let file_out = process.argv[3];

main();

async function main() {
	let vr = new VoxReader(fs.readFileSync(`./${file_in}.vox`));
	let vm = new VoxMerge(vr);
	let merged = vm.getRootModel({2:true});
	let ve = new VoxExport(merged[1],merged[2],vr.getPalette());
	ve.setSplit(36);
	let rotates = await ve.createRotates()
	for(let i = 0; i < rotates.length; i++) {
		rotates[i].resize(rotates[i].bitmap.width*4,rotates[i].bitmap.height*4,Jimp.RESIZE_NEAREST_NEIGHBOR).write(`rotate/${`${i}`.padStart(3,"0")}_${file_out}.png`);
	}
}
