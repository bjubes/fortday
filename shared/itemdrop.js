//the in world version of an item
//has position and a reference to the prefab version via "id"

class ItemDrop {
	constructor(id,x,y){
		if (arguments.length == 1) {
			Object.assign(this, id);
		} else {

			this.id = id;
			this.x = x;
			this.y =y;
		}
	}
}

if (typeof window === 'undefined') {
	module.exports = ItemDrop
} else {
	window.Item = ItemDrop
}