//the in world version of an item
//has position and a reference to the prefab version via "id"

class ItemDrop {
	constructor(id,x,y){
		if (arguments.length == 1) {
			//unpack initpackage into seperate parameters
			Object.assign(this, id);
		} else {

			this.id = id;
			this.x = x;
			this.y =y;
		}
	}

	render(ctx){
		var image = window.itemSpriteDict[this.id]
	    ctx.drawImage(resources.get('/client/assets/'+ image +'.svg'),this.x,this.y,64,64)
	}
}

if (typeof window === 'undefined') {
	module.exports = ItemDrop
} else {
	window.Item = ItemDrop
}