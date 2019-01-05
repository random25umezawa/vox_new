const Jimp = require("jimp");

class VoxExport {
	constructor(_size,_blocks,_palette) {
		this.size = _size;
		this.blocks = _blocks;
		this.palette = _palette;
	}

	async exportDanmens(path) {
		let ys = [...Array(this.size[1]).keys()];
		let layers = [...Array(this.size[1]).keys()].map(_=>[]);
		for(let block of this.blocks) {
			layers[block[1]].push(block);
		}
		let danmen_images = await Promise.all(ys.map(y=>this.createDanmen(y,layers[y])));
		for(let y of ys) {
			danmen_images[y].write(`${y}_${path}`);
		}
	}

	async createDanmen(y,layer) {
		let img = await this.createImageAsync(this.size[0],this.size[2]);
		for(let block of layer) {
			img.setPixelColor((this.palette[block[3]]>>>0),block[0],block[2]);
		}
		return img;
	}

	createImageAsync(w,h) {
		return new Promise((resolve,reject) => {
			new Jimp(w,h,function(err,img) {
				if(err) reject(err);
				resolve(img);
			});
		})
	}
}

module.exports = VoxExport;
