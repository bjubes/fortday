isNode = false
if (typeof window === 'undefined'){
	itemInNodeJS = require("./item.js")
	isNode = true
}
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
	    ctx.drawImage(resources.get('/client/assets/'+ image +'.svg'),this.x-24,this.y-24,48,48)
/*
	    ctx.beginPath()
        ctx.arc(this.x,this.y,5,0,2*Math.PI)
        ctx.fill()
        ctx.stroke()
*/
	}

	getPrefab(){
		if (isNode){
			return itemInNodeJS.prefab[this.id]
		} else {
			return Item.prefab[this.id]
	}	}

	getName(){
		return this.getPrefab().name
	}
}

if (typeof window === 'undefined') {
	module.exports = ItemDrop
} else {
	window.Item = ItemDrop
}