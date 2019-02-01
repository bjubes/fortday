var playerList = {}
var clientPlayer = null
var itemDropList = {}
var nearestItemDrop = null
var sqrReachDistance = reachDistance * reachDistance

class Player {

    constructor(initPackage){
        this.name = initPackage.name;
        this.id = initPackage.id;
        this.x = initPackage.x;
        this.y = initPackage.y;
        this.rotation = initPackage.rotation
        this.color = initPackage.color;
        this.state = initPackage.state;

         this.inventory = {
            "skin": Item.prefab.skin_0
        }

        //client only stuff
        this.animator = new Animator()
        this.onNextUpdate =  null //a one time callback that is executed during 
        //bookkeeping
        playerList[this.id] = this;
    }
}



//TODO: make it so game doesnt error if this isnt instanciated before all loops and whatnot

//this is sent to existing players when a new player joins and
//to a new player to tell them about existing players
socket.on('newPlayer', function(initPackages){
    for(var i in initPackages){
        var initPackage = initPackages[i]
        new Player(initPackage)
    }
})

socket.on('newItemDrop', function(initPackages){
    for(var i in initPackages){
        var initPackage = initPackages[i]
        itemDropList[i] = new ItemDrop(initPackage)
    }
})

socket.on("deleteItemDrop", function(id){
    delete itemDropList[id]
})

socket.on('pickupDropItemRejected', function(data){
   
    itemDropList = {}
    socket.emit("getItemDropInit")

    
    console.log(data.inventory.skin)

    //our itemlist is out of sync, so get a new one, by using IDs and getting prefab.
    //hte actual inventory sent by server can't have lambdas or other prefab data sent as well

    for (const [key, incompleteItem] of Object.entries(data.inventory)) {
            var itemID = incompleteItem.id
            var item = Item.prefab[itemID]
            clientPlayer.inventory[item.equipSpot] = item
    


            //because on equip should be tings like changign color or gameplay safe, we will recall them on the old item
            //even if this is adverse, it only happens on client side.
            item.onEquip(clientPlayer)
    }
})


socket.on('update',function(delta){
    //delta is {players: [{id,x,y},{id,x,y}], tiles:[{id,x,y},{id,x,y}]}
    for(var i = 0; i < delta.players.length; i++){
        var newInfo = delta.players[i];
        if (!(newInfo.id in playerList)) {
            //we got an update about a player we don't know about
            //TODO: request this players init
            continue;
        }
        var player = playerList[newInfo.id]
        //update every value in player that exists in the deltapack
        for(key in newInfo){
            //except id
            if(key == "id") {continue;}
            player[key] = newInfo[key]
            if(key == "state" && player !=clientPlayer && player[key] == 1) {
                //another player is attacking
                player.onNextUpdate =  player.animator.punch.play()
            }
        }
        // save changes
        playerList[newInfo.id] = player;
    }
});

//update screen every frame based on locally cached information
function init() {
    requestAnimationFrame(update)
}

function update(){
    if (playerID == null){
        requestAnimationFrame(update)
        return
    }
    if (clientPlayer == null){
        clientPlayer = playerList[playerID]
    }
    var rot = Math.atan2( mousePos.y - clientPlayer.y, mousePos.x-clientPlayer.x )
    if (rot != clientPlayer.rot) 
    {
        socket.emit("newRotation", rot)
        lastRot = rot
        clientPlayer.rot = rot
    }

    //see if a dropItem is close by
    nearestItemDrop = null
    var closestDist = sqrReachDistance


    for(var i in itemDropList){
        var item = itemDropList[i]

        var newDist = sqrdist(item,clientPlayer)
        if (newDist < closestDist) {
            nearestItemDrop = item
            nearestItemDrop.inGameID = i
            closestDist = newDist
        }

    }

   

    //DRAWING - bottom to top
    ctx.clearRect(0,0,500,500);

     for(var i in itemDropList) {
        var item = itemDropList[i]
        item.render(ctx)
    }

    for(var i in playerList) {
        var player = playerList[i];
 
        player.animator.animationUpdate();

        ctx.save();
        ctx.translate(player.x, player.y);


        ctx.rotate(player.rotation)
        ctx.drawImage(resources.get('/client/assets/'+ player.animator.image +'.svg'),-size/2,-size/2,size*player.animator.xSize,size)
        ctx.beginPath()
        ctx.arc(0,0,5,0,2*Math.PI)
        ctx.fillStyle = player.color;
        ctx.fill()
        if (DEBUG_DRAW_PUNCH_COLLIDER){
            ctx.ellipse(35, 0, 20,35, 0, 0, 2 * Math.PI);
            ctx.fill()
        }
        ctx.stroke()
        ctx.restore();

        //ctx.drawImage(resources.get('/client/assets/player.png'),player.x-size/2,player.y-size/2,size,size)
        /*
        ctx.beginPath()
        ctx.arc(player.x,player.y,size,0,2*Math.PI)
        ctx.fillStyle = player.color;
        ctx.fill()
        ctx.stroke()
        */
    }

     if (nearestItemDrop != null){
        ctx.textAlign = "center"
        ctx.font = "14px Arial";
        ctx.fillText(nearestItemDrop.getName(), nearestItemDrop.x,nearestItemDrop.y+32)
    }

    requestAnimationFrame(update)
}

function onClick(){
    socket.emit("clientRequestingAttack")

    if(clientPlayer.animator.nextState == null){
        //we are (from this client's perspective) not already punching or shooting
        clientPlayer.animator.punch.play()
    }
}

socket.on('playerDisconnect', function(data){
	delete playerList[data.id];
})

resources.load([
    '/client/assets/player-128.svg',
    '/client/assets/player-punch-left-128.svg',
    '/client/assets/player-punch-right-128.svg',
    '/client/assets/skin-icon-64.svg'
]);

resources.onReady(init);

//////////MOVEMENT AND KEY DETECTION //////////////////////

keyState  = {}
keystatewhitelist = [68,87,65,83]

//TODO: bail if user is focused on a text box (ie chat)
window.addEventListener('keydown',function(e){onKeyDown(e);},true);
window.addEventListener('keyup',function(e){onKeyUp(e);},true);

function onKeyDown(e){
    onKeyDownOrUp(e,true)
    var keycode = e.keyCode || e.which
    if (keycode == 70 && nearestItemDrop != null) {
        //F key
        socket.emit("requestPickupDropItem", nearestItemDrop.inGameID)
        //assume we can legally pick up this item

        delete itemDropList[nearestItemDrop.inGameID]
        var itemPrefab = nearestItemDrop.getPrefab()


        //we don't drop our old stuff locally for "creating id reasons"
        clientPlayer.inventory[itemPrefab.equipSpot] = itemPrefab;
        itemPrefab.onEquip(clientPlayer)

    }
}
function onKeyUp(e){
    onKeyDownOrUp(e,false)
}

function onKeyDownOrUp(e,isKeyDown) {
     var keycode = e.keyCode || e.which
    if (keystatewhitelist.includes(keycode) == false){
        return;
    }
    //this is a key event relevent to the server
    keyState[keycode] = isKeyDown;
    socket.emit('clientMovementKeyChange', keyState);
}


//when window loses focus, for key up for all keys
window.onblur = function(){

    for(var key in keyState){
        keyState[key] = false
    }
    socket.emit('clientMovementKeyChange', keyState);
};

var mousePos = {};

canvas.addEventListener('mousemove', function(evt) {
    mousePos = updateMousePos(evt);  
},false);

function updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
    };
}

canvas.addEventListener('click',onClick);


function sqrdist(a,b){
    return (b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y)
}