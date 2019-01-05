class Vox{
	constructor(_data) {
		this.data = _data;
		this.cursor = 0;
		this.getString(4);
		this.getValue(4);
		this.models = [];
		this.nodes = {};
		this.chunk = this.getChunk();
	}

	basicChunkInfo() {
		return {
			n: this.getValue(4),
			m: this.getValue(4),
			children: {}
		};
	}

	readChildChunks() {
		let children = {};
		while(this.hasNext()) {
			let chunk = this.getChunk();
			if(!children[chunk.name]) children[chunk.name] = [];
			children[chunk.name].push(chunk);
		}
		return children;
	}

	chunkMain() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.data = this.getSubData(chunk_data.n);
		chunk_data.children = this.readChildChunks();
		return chunk_data;
	}

	chunkPack() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.data = this.getValue(chunk_data.n);
		return chunk_data;
	}

	chunkSize() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.data = [this.getValue(4),this.getValue(4),this.getValue(4)];
		chunk_data.x = chunk_data.data[0];
		chunk_data.y = chunk_data.data[1];
		chunk_data.z = chunk_data.data[2];
		return chunk_data;
	}

	chunkXyzi() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.data = [];
		chunk_data.numVoxels = this.getValue(4);
		chunk_data.blocks = [];
		for(let i = 0; i < chunk_data.numVoxels; i++) {
			chunk_data.blocks.push(
				[this.getValue(1),this.getValue(1),this.getValue(1),this.getValue(1)]
			);
		}
		this.models.push(chunk_data.blocks);
		return chunk_data;
	}

	chunkRgba() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.data = [];
		for(let i = 0; i < 0x100; i++) {
			chunk_data.data.push(this.getValue(4));
		}
		//console.log("palette",JSON.stringify(chunk_data.data));
		chunk_data.data = this.convertPalette(chunk_data.data);
		return chunk_data;
	}

	chunkMatt() {
		let chunk_data = this.basicChunkInfo();
		return chunk_data;
	}

	chunknTRN() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.node_id = this.getValue(4);
		chunk_data.node_attribute = this.typeDICT();
		chunk_data.child_node_id = this.getValue(4);
		chunk_data.reserved_id = this.getValue(4);
		chunk_data.layer_id = this.getValue(4);
		chunk_data.num_of_frames = this.getValue(4);
		chunk_data.frames = [];
		for(let i = 0; i < chunk_data.num_of_frames; i++) {
			chunk_data.frames.push(this.typeDICT());
		}
		chunk_data.transform = {x:0,y:0,z:0};
		if(chunk_data.frames[0]["_t"]) {
			let _xyz_t = chunk_data.frames[0]["_t"].split(" ").map(_str=>parseInt(_str));
			chunk_data.transform = {x:_xyz_t[0],y:_xyz_t[1],z:_xyz_t[2]};
		}
		chunk_data.rotation = [[1,0,0],[0,1,0],[0,0,1]];
		if(chunk_data.frames[0]["_r"]) {
			let _r_b = chunk_data.frames[0]["_r"];
			chunk_data.rotation = [[0,0,0],[0,0,0],[0,0,0]];
			let _1_row_index = ((_r_b>>0)&0b0000011);
			let _2_row_index = ((_r_b>>2)&0b0000011);
			let _3_row_index = 0;
			let _1_sign = ((_r_b>>4)&0b0000001)==1;
			let _2_sign = ((_r_b>>5)&0b0000001)==1;
			let _3_sign = ((_r_b>>6)&0b0000001)==1;
			chunk_data.rotation[0][_1_row_index] = (_1_sign?-1:1);
			chunk_data.rotation[1][_2_row_index] = (_2_sign?-1:1);
			chunk_data.rotation[2][_3_row_index] = (_3_sign?-1:1);
		}
		return chunk_data;
	}

	chunknGRP() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.node_id = this.getValue(4);
		chunk_data.node_attribute = this.typeDICT();
		chunk_data.num_of_children = this.getValue(4);
		chunk_data.children = [];
		for(let i = 0; i < chunk_data.num_of_children; i++) {
			chunk_data.children.push(this.getValue(4));
		}
		return chunk_data;
	}

	chunknSHP() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.node_id = this.getValue(4);
		chunk_data.node_attribute = this.typeDICT();
		chunk_data.num_of_models = this.getValue(4);
		chunk_data.models = [];
		for(let i = 0; i < chunk_data.num_of_models; i++) {
			chunk_data.models.push([this.getValue(4),this.typeDICT()]);
		}
		return chunk_data;
	}

	chunkMATL() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.material_id = this.getValue(4);
		chunk_data.material_properties = this.typeDICT();
		return chunk_data;
	}

	chunkLAYR() {
		let chunk_data = this.basicChunkInfo();
		chunk_data.layer_id = this.getValue(4);
		chunk_data.layer_attribute = this.typeDICT();
		chunk_data.reserved = this.getValue(4);
		return chunk_data;
	}

	chunkrOBJ() {
		let chunk_data = this.basicChunkInfo();
		//chunk_data.obj_id = this.getValue(4);
		chunk_data.obj_attribute = this.typeDICT();
		//chunk_data.reserved = this.getValue(4);
		return chunk_data;
	}

	getChunk() {
		if(!this.hasNext()) return null;
		let name = this.getString(4);
		let chunk = {};
		if(name=="MAIN") chunk = this.chunkMain();
		if(name=="PACK") chunk = this.chunkPack();
		if(name=="SIZE") chunk = this.chunkSize();
		if(name=="XYZI") chunk = this.chunkXyzi();
		if(name=="RGBA") chunk = this.chunkRgba();
		if(name=="MATT") chunk = this.chunkMatt();
		if(name=="nTRN") chunk = this.chunknTRN();
		if(name=="nGRP") chunk = this.chunknGRP();
		if(name=="nSHP") chunk = this.chunknSHP();
		if(name=="MATL") chunk = this.chunkMATL();
		if(name=="LAYR") chunk = this.chunkLAYR();
		if(name=="rOBJ") chunk = this.chunkrOBJ();
		chunk.name = name;
		if(chunk.node_id>=0) {
			this.nodes[chunk.node_id] = chunk;
		}
		return chunk;
	}

	getModel(chunk) {
		let name = chunk.name;
		if(name=="nTRN") {
			return this.transformXYZI(this.getModel(this.nodes[chunk.child_node_id]),chunk.transform,chunk.rotation);
		}
		if(name=="nGRP") {
			return this.mergeXYZI(chunk.children.map(_child_node_id=>this.getModel(this.nodes[_child_node_id])));
		}
		if(name=="nSHP") {
			return this.mergeXYZI(chunk.models.map(_arr=>this.models[_arr[0]]));
		}
	}

	transformXYZI(_blocks,_offset,_rotation) {
		let ret = [];
		for(let _block of _blocks) {
			let _rotated = [0,0,0];
			for(let i = 0; i < 3; i++) {
				for(let j = 0; j < 3; j++) {
					_rotated[i] += _rotation[i][j]*_block[j];
				}
			}
			ret.push([_rotated[0]+_offset.x,_rotated[1]+_offset.y,_rotated[2]+_offset.z,_block[3]]);
		}
		return ret;
	}

	mergeXYZI(_arr) {
		let _block_dict = {};
		for(let _blocks of _arr) {
			for(let _block of _blocks) {
				let _str = `${_block[0]},${_block[1]},${_block[2]}`;
				//if(!_block_dict[_str]) {
					_block_dict[_str] = _block;
				//}
			}
		}
		let ret = [];
		for(let key of Object.keys(_block_dict)) {
			let _block = _block_dict[key];
			ret.push([_block[0],_block[1],_block[2],_block[3]]);
		}
		return ret;
	}

	defaultPalette() {
		return [
			0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff,
			0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff, 0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff,
			0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
			0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc,
			0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc, 0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99,
			0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
			0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66,
			0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66, 0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666,
			0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
			0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933,
			0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633, 0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033,
			0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00, 0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00,
			0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600, 0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300,
			0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000, 0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044,
			0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
			0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111
		];
	}

	convertPalette(temp_palette) {
		let return_palette = [0x00000000];
		//console.log("palette");
		for(let i = 0; i < temp_palette.length-1; i++) {
			return_palette.push(((temp_palette[i]&0x0000ff)<<24)+((temp_palette[i]&0x00ff00)<<8)+((temp_palette[i]&0xff0000)>>8)+((temp_palette[i]&0xff000000)>>24));
			//console.log(0x000000ff,((temp_palette[i]&0x0000ff)),((temp_palette[i]&0x00ff00)>>8),((temp_palette[i]&0xff0000)>>16));
		}
		return return_palette;
	}

	typeSTRING() {
		let _len = this.getValue(4);
		let _str = this.getString(_len);
		return _str;
	}

	typeDICT() {
		let _cnt = this.getValue(4);
		let _dict = {};
		for(let i = 0; i < _cnt; i++) {
			_dict[this.typeSTRING()] = this.typeSTRING();
		}
		return _dict;
	}

	hasNext() {
		return this.cursor<this.data.length;
	}

	next() {
		this.cursor++;
	}

	getSubData(_len) {
		return this.data.slice(this.cursor,Math.min(this.data.length,this.cursor+_len));
	}

	getString(_len) {
		let _ret = "";
		for(let i = this.cursor, j = 0; this.hasNext()&&j<_len; this.next(),i++,j++) {
			_ret += String.fromCharCode(this.data[i]);
		}
		return _ret;
	}

	getValue(_len) {
		let _ret = 0;
		for(let i = this.cursor, j = 0;this. hasNext()&&j<_len; this.next(),i++,j++) {
			_ret += this.data[i] << 8*j;
		}
		return _ret;
	}
}

module.exports = Vox;
