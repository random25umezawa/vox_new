const fs = require("fs")
const VoxReader = require("./vox_reader.js")
const VoxMerge = require("./vox_merge.js")
const VoxExport = require("./vox_export.js")

let vr = new VoxReader(fs.readFileSync("./reftestvox.vox"));
let vm = new VoxMerge(vr);
let merged = vm.getRootModel({2:true});
let ve = new VoxExport(merged[1],merged[2],vr.getPalette());
ve.exportDanmens("kekka.png")
.then(_=>console.log(_));
