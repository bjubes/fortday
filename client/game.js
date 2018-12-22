
var playerList = {}
var clientPlayer = null

class Player {
    constructor(initPackage){
        this.name = initPackage.name;
        this.id = initPackage.id;
        this.x = initPackage.x;
        this.y = initPackage.y;
        this.rotation = initPackage.rotation
        this.color = initPackage.color;
        this.state = initPackage.state;

        //client only stuff
        this.animator = new Animator()
        this.onNextUpdate =  null //a one time callback that is executed during 
        //bookkeeping
        playerList[this.id] = this;
    }
}

var lastRot = 0;


//TODO: make it so game doesnt error if this isnt instanciated before all loops and whatnot

//this is sent to existing players when a new player joins and
//to a new player to tell them about existing players
socket.on('newPlayer', function(initPackages){
    for(var i in initPackages){
        var initPackage = initPackages[i]
        new Player(initPackage)
    }
})

socket.on('newBoard', function(initPackage){
    board = new Board(initPackage)
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
    if (rot != lastRot) 
    {
        socket.emit("newRotation", rot)
        lastRot = rot
    }
    

    //DRAWING
    ctx.clearRect(0,0,500,500);

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
    requestAnimationFrame(update)
}

function onClick(){
    //attack!
    socket.emit("clientRequestingAttack")

    //for now we assume punching
    clientPlayer.animator.punch.play()
}

socket.on('playerDisconnect', function(data){
	delete playerList[data.id];
})

resources.load([
    '/client/assets/player-128.svg',
    '/client/assets/player-punch-left-128.svg',
    '/client/assets/player-punch-right-128.svg'
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

 /////////////// UTILTIES ////////////////////////////
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
