const Jimp = require("jimp");

class VoxExport {
	constructor(_size,_blocks,_palette) {
		this.size = _size;
		this.blocks = _blocks;
		this.palette = _palette;
	}

	setSplit(split) {
		this.split = split;
	}

	async createRotates() {
		let zs = [...Array(this.size[2]).keys()];
		let layers = zs.map(_=>[]);
		for(let block of this.blocks) {
			layers[block[2]].push(block);
		}
		let danmen_images = await Promise.all(zs.map(z=>this.createDanmen(z,layers[z])));

		let angles = [...Array(this.split).keys()].map(num=>360*num/this.split);
		let rotate_images = await Promise.all(angles.map(angle=>this.createRotateImage(angle,danmen_images)));
		return rotate_images;
	}

	async createDanmen(z,layer) {
		let path_long = Math.max(this.size[0],this.size[1]);
		let img = await this.createImageAsync(path_long*2,path_long*2);
		for(let block of layer) {
			img.setPixelColor((this.palette[block[3]]>>>0),block[0]+path_long/2+(path_long-this.size[0])/2,block[1]+path_long/2+(path_long-this.size[1])/2);
		}
		return img.flip(false,true);
	}

	async createRotateImage(angle,danmen_images) {
		let path_long = Math.max(this.size[0],this.size[1]);
		let img = await this.createImageAsync(path_long*2*2,path_long*2+this.size[2]*2-1);
		for(let i = 0; i < danmen_images.length; i++) {
			let danmen_image = danmen_images[i].clone();
			danmen_image.resize(danmen_image.bitmap.width*2,danmen_image.bitmap.height*2,Jimp.RESIZE_NEAREST_NEIGHBOR);
			danmen_image.rotate(angle,false);
			danmen_image.resize(danmen_image.bitmap.width,danmen_image.bitmap.height/2,Jimp.RESIZE_NEAREST_NEIGHBOR);
			for(let j = 0; j < 2; j++) {
				img.composite(danmen_image,0,danmen_images.length*2-i*2-j-1);
			}
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
