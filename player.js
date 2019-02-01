var Util = require('./utilities.js')
var Lobby = require('./lobby.js')
var Item = require('./shared/item.js')
var ItemDrop = require('./shared/itemdrop.js')

class Player {

    constructor(id, name, lobby){
        if(name == ""){
            name = id //TODO: generate random names
        }
        this.lobby = lobby;
        this._name = name;
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this._color = '#FFCD94' //same color as default skin
        this.velocity = {'x':0,'y':0}
        this.health = 100;

        //state related vars 
        this._state = Player.state.free
        this.punchTime = 10;
        this.stateTimer = 0;

        //inventory
        this.inventory = {
            "skin": Item.prefab.skin_0
        }

        //flags
        this.delta = {} // delta.<attribute> MUST correspond to player.<attribute>, otherwise updatePacket will fail
        this.delta.name = false
        this.delta.color = false

        this.lobby.playerList[id] = this;
    }

    //setters and getters
    get name(){return this._name}
    set name(val){
        this.delta.name = true
        this._name = val
    }
    get color(){return this._color}
    set color(val){
        this.delta.color = true
        this._color = val
    }
    get state(){return this._state}
    set state(val){
        if (Number.isInteger(val) && val < Object.keys(Player.state).length){
            this._state = val
            this.delta.state = true;
        } else {
            console.log("ERROR - enum assigned to nonexistent value")
        }
    }

    //static vars
    static get speed() {return 3}
    static get reachDistance(){return 75}
    static get state() {
        return {
            'free':0,
            'attacking':1
        };
    }

    //static events
    static onConnect(socket, name, lobby) {
        //create a new player server side
        var player = new Player(socket.id, name, lobby);
        player.registerInputHandler(socket);
        player.sendNewPlayerInit(socket);
        player.updateExistingPlayers();

        player.lobby.sendNewPlayerItems(socket);
        return player;
    }

    static onDisconnect(socket) {
        delete socket.lobby.playerList[socket.id]
        Util.broadcast("playerDisconnect", {id: socket.id})
    }

    registerInputHandler(socket) {
        let player = this; // if we use 'this' inside callback it returns 'socket'
                           // so we cache the player object while its referenced by 'this'
        socket.on('newRotation', function(rotation){
            player.rotation = rotation
            player.delta.rotation = true
        })

        socket.on('getItemDropInit',function(){
            player.lobby.sendNewPlayerItems(socket,false)
        })

        socket.on('requestPickupDropItem', function(itemDropID){
            console.log(itemDropID)
            var item = player.lobby.getItemDrop(itemDropID)
            console.log(item)
            var sqrDist = Util.sqrDist(player,item)

            if (item == undefined || item == null || sqrDist > Player.reachDistance * Player.reachDistance){
                //rejected. this item doesnt exist or is too far away.
                socket.emit('pickupDropItemRejected', {prefab: item, inventory: player.inventory})
                return
            }
            //we can pick up this item, so do it
            player.pickupItem(itemDropID)
        })

        socket.on('clientRequestingAttack',function(){
            //player hit the fire button
            //for now, assume no weapon...so we punch

            //lets calculate a hitbox.... shit this is gonna be a lot of math...
            // https://stackoverflow.com/a/2945439/4283285 is gonna be our approach
            // our goal is to make an ellipse from two points and a distance ('e')
            
            //lets start by offsetting 35 units in front of the player.
            var center = {x:0,y:0}
            center.x = player.x + 35 * Math.cos(player.rotation)
            center.y = player.y + 35 * Math.sin(player.rotation)

            //now lets get the two foci by going perpendicular...
            //get a copy of the center to modify
            var foci1= {x:0,y:0}
            var foci2 = {x:0,y:0}
            foci1.x = center.x + 15 * Math.cos(player.rotation + Math.PI/2)
            foci1.y = center.y + 15 * Math.sin(player.rotation + Math.PI/2)
            foci2.x = center.x - 15 * Math.cos(player.rotation + Math.PI/2)
            foci2.y = center.y - 15 * Math.sin(player.rotation + Math.PI/2)

            //now lets get every player (optimize this list down to players nearby or something...)
            // and see if they intersect
            for (var key in player.lobby.playerList){
                var p = player.lobby.playerList[key]

                //we cant punch ourselves
                if (p.id == player.id){
                    continue
                }

                //find line from foci to circle center
                var dx = Math.abs(p.x - player.x)
                var dy = Math.abs(p.y - player.y)
                if (dx * dx + dy* dy > 36864) {// this is 64 * 3 squared.. 
                   // you can't punch someone who is more than 3x away from you
                    continue
                }
                //refer to the diagram on stackoverflow to make sense of variable names
                var ACdx = Math.abs(foci1.x - p.x)
                var ACdy = Math.abs(foci1.y - p.y)
                var ac = Math.sqrt(ACdx * ACdx + ACdy *ACdy)

                //for performance.. if this is already out of range, just return now
                //to save the extra sqrt calculation
                if (ac > 64 + 40){
                    continue
                }

                var BCdx = Math.abs(foci2.x - p.x)
                var BCdy = Math.abs(foci2.y - p.y)
                var bc = Math.sqrt(ACdx * ACdx + ACdy *ACdy)

                //the diameter of the player is 64
                // 40 is the sum of the dist from foci to edge
                if (ac + bc < 64 + 40){
                    console.log(player.name +" punched " + p.name)
                    p.health -= 15; //should not be hardcoded...
                }
            }

            //tell everyone else they are are attacking
            if (player.state == Player.state.free){
                player.state = Player.state.attacking
                player.stateTimer = player.punchTime
            }
        })
        socket.on('clientMovementKeyChange', function(data) {
           // data is a dictionary of keycodes
           // we need to conver that into a direction
            var direction = -1
            if (data[87]){
                //up
                direction = 2
                if(data[68]){
                    //right
                    direction--
                }
                else if (data[65]){
                    //left
                    direction++
                }
            }
            else if (data[83]){
                //down
                direction = 6
                if(data[68]){
                    //right
                    direction++
                }
                else if (data[65]){
                    //left
                    direction--
                }
            }
            else{
                 if (data[65]){
                    //left 
                    direction = 4
                }
                else if (data[68]){
                    //right
                    direction = 0
                } else {

                    //client is not moving
                    player.velocity.x = 0
                    player.velocity.y = 0
                    return
                }
            }

            //now cover that number into x,y coords
            var x = Math.cos(direction*Math.PI/4)
            var y = -Math.sin(direction*Math.PI/4)
            player.velocity.x = x
            player.velocity.y = y

        });
    }

    //sends "per request" information to a new player to catch them up
    //with stuff already happenign in the game
    updateExistingPlayers(){
        //send existing players my info
        var initPackages = {}
        initPackages[this.id] = this.initPackage()
        Util.broadcast("newPlayer", initPackages);
    }

    sendNewPlayerInit(socket) {
        //give the new player, this, the information about other players
        var initPackages = {}
        for(var i in this.lobby.playerList){
            var player = this.lobby.playerList[i]
            initPackages[player.id] = player.initPackage()
        }
        socket.emit("newPlayer", initPackages)
    }

    static idToName(id){
        var player = Lobby.getPlayerFromId(id);
        if (player == undefined){
            return id
        }
        return player.name
    }

    move() {
        var speed = Player.speed
        this.x += this.velocity.x * speed
        this.y += this.velocity.y * speed
        this.lobby.onPlayerMoved(this);

        this.delta.x = (this.velocity.x != 0)
        this.delta.y = (this.velocity.x != 0)
    }

    tick() {
        this.move()

        if (this.state == Player.state.attacking){
            if (this.stateTimer > 0){
                this.stateTimer--
            } else {
                this.state = Player.state.free
            }           
        }
    }

    pickupItem(id){
        var itemDrop = this.lobby.getItemDrop(id)
        var item = itemDrop.getPrefab()
        var spot = item.equipSpot
        console.log(item)
        if(this.inventory[spot] != null && this.inventory[spot] != undefined  ){
            //we already have one of these... drop the old one!
            this.dropItem(spot)
        }
        this.lobby.removeDropItemViaID(id)
        this.inventory[spot] = item
        item.onEquip(this)
    }
    
    dropItem(spot){
        var itemDrop = new ItemDrop(this.inventory[spot].id,this.x,this.y)
        this.lobby.addDropItem(itemDrop)
    }

    initPackage(){
        var fullPack = {
            id: this.id,
            x: this.x,
            y: this.y,
            color: this.color,
            rotation: this.rotation,
            state: this.state
        }

        return fullPack
    }

    updatePacket(ignoreDeltas = false) {
        var pack = {
            id: this.id
        };
        var isDirty = false
        
        for (var d in this.delta){
            if (this.delta[d]){
                pack[d] = this[d]
                isDirty = true
            }
        }

        //we have seen all changes, so reset the delta object
        this.delta = {}

        // return the pack only if something has changed
        if (isDirty){
            //console.log(pack)
            return pack
        } else{
            return null
        }
    }
}

module.exports = Player;
