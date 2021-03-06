//the data respresentation of an item
//contains only data relevant to its usage, not any positonal data
//or player relationship to its owner

class Item {
	constructor(id,name,equipSpot,onEquip)
	{
		this.id =id
		this.name = name
		this.equipSpot = equipSpot
		this.onEquip = onEquip
	}

	static get prefab(){
		return{
			"skin_0" : new Item("skin_0","Default Skin","skin",function(p){
				p.color = '#FFCD94'
			}),
			"skin_1" : new Item("skin_1","Magenta Skin","skin",function(p){
				p.color = '#8B008B';
			}),
			"gun_0" : new Item("gun_0","Assault Rifle","gun",Item.gunEquip)








		}
	}

	static gunEquip(p) {
		if (p.weapon == null){
			p.weapon = "gun_0"
			if (p.animator != null){
				p.animator.onWeaponChanged(p.weapon)
			}
		}
	}
}

if (typeof window === 'undefined') {
	module.exports = Item
} else {
	window.Item = Item
}