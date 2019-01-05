class Vox2D{
	constructor(_data) {
		this.data = _data;
		this.models = this.getModels();
		this.sizes = this.getSizes()
		this.nodes = this.getNodes();
	}

	getModels() {
		return this.data.chunk.children.XYZI.map(chunk=>chunk.blocks);
	}

	getSizes() {
		return this.data.chunk.children.SIZE.map(chunk=>chunk.data);
	}

	getNodes() {
		let _arr = {};
		let _reg = chunk=>{_arr[chunk.node_id]=chunk};
		this.data.chunk.children.nTRN.map(_reg);
		this.data.chunk.children.nGRP.map(_reg);
		this.data.chunk.children.nSHP.map(_reg);
		return _arr;
	}

	getRootModel() {
		return this.getModel(this.nodes[0]);
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
			return this.mergeXYZI(chunk.models.map(_arr=>[[0,0,0],this.sizes[_arr[0]],this.models[_arr[0]]]));
		}
	}

	transformXYZI(_arr,_offset,_rotation) {
		let ret = [];
		let _pos = _arr[0];
		let _size = _arr[1];
		let _blocks = _arr[2];
		let _rotate_base = [0,0,0];
		_pos[0] += _offset.x;
		_pos[1] += _offset.y;
		_pos[2] += _offset.z;
		for(let i = 0; i < 3; i++) {
			for(let j = 0; j < 3; j++) {
				_rotate_base[i] += _rotation[i][j]*1;
			}
		}
		for(let _block of _blocks) {
			let _rotated = [0,0,0];
			for(let i = 0; i < 3; i++) {
				for(let j = 0; j < 3; j++) {
					_rotated[i] += _rotation[i][j]*_block[j];
				}
			}
			ret.push([
				_rotated[0]+((_rotate_base[0]<0)?_size[0]-2:0),
				_rotated[1]+((_rotate_base[1]<0)?_size[1]-2:0),
				_rotated[2]+((_rotate_base[2]<0)?_size[2]-2:0),
				_block[3],
			]);
		}
		return [_pos,_size,ret];
	}

	mergeXYZI(_arr) {
		if(_arr.length==1) return _arr[0];
		let _min_offset = [9999,9999,9999];
		let _max_offset = [-999,-999,-999];
		for(let _set of _arr) {
			let _pos = _set[0];
			let _size = _set[1];
			let _blocks = _set[2];
			for(let i = 0; i < 3; i++) {
				_min_offset[i] = Math.min(_min_offset[i],_pos[i]);
				_max_offset[i] = Math.max(_max_offset[i],_pos[i]+_size[i]);
			}
		}

		let _merged_size = [];
		for(let i = 0; i < 3; i++) {
			_merged_size.push(_max_offset[i]-_min_offset[i]);
		}

		let _block_dict = {};
		for(let _set of _arr) {
			let _pos = _set[0];
			let _size = _set[1];
			let _blocks = _set[2];
			for(let _block of _blocks) {
				let _xyz = [];
				for(let i = 0; i < 3; i++) _xyz.push(_block[i]+_pos[i]-_min_offset[i]);
				let _str = _xyz.join(",");
				_xyz.push(_block[3]);
				_block_dict[_str] = _xyz;
			}
		}

		let ret = [];
		for(let key of Object.keys(_block_dict)) {
			let _block = _block_dict[key];
			ret.push([_block[0],_block[1],_block[2],_block[3]]);
		}

		return [_min_offset,_merged_size,ret];
	}
}

module.exports = Vox2D;
