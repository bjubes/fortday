//the data respresentation of an item
//contains only data relevant to its usage, not any positonal data
//or player relationship to its owner

class Item {
	constructor(id,name,onEquip)
	{
		this.id =id
		this.name = name
		this.onEquip = onEquip
	}

	static get prefab(){
		return{
			"skin_0" : new Item("skin_0","Default Skin",function(p){
				p.color = '##FFCD94'
			}),
			"skin_1" : new Item("skin_0","Magenta Skin",function(p){
				p.color = '#8B008B'
			}),








		}
	}
}

if (typeof window === 'undefined') {
	module.exports = Item
} else {
	window.Item = Item
}