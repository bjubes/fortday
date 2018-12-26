var express = require('express');
var app = express();
var serv = require('http').Server(app);

//custom requires
var Player = require('./player.js')
var Util = require('./utilities.js')
var Lobby = require('./lobby.js')
var ItemDrop = require('./shared/itemdrop.js')

//https on heroku
app.get('*', function(req,res,next) {
  if(req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV === 'production')
    res.redirect('https://'+req.hostname+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
});
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use('/shared',express.static(__dirname + '/shared'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

DEBUG = process.env.DEBUG
SOCKET_LIST = {}
var lobby = new Lobby()

/// hardcoding items into lobby

lobby.itemDropList["index"] = new ItemDrop("skin_0",50,50)

///

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Util.generateId();

	//give the player a lobby
	socket.lobby = lobby
	SOCKET_LIST[socket.id] = socket;

	socket.on('login', function(data){
		//TODO: validate playername

		var player = Player.onConnect(socket, data.name, lobby);
	    console.log("New Conection - name: ", player.name, ", id: ", socket.id)
		socket.emit("loginResponse",{success: true, id: player.id})
	})

	socket.on('disconnect',function(){
		var name = Player.idToName(socket.id)
		Player.onDisconnect(socket)
		console.log("User Disconnected - name: ", name, ", id: ", socket.id)
		delete SOCKET_LIST[socket.id];
	});

	socket.on('chatToServer',function(data){
	   var playerName = Player.idToName(socket.id, lobby)
	   Util.broadcast('addToChat', {name: playerName, msg: data});
   });

   socket.on('evalServer',function(data){
	   if(!DEBUG)
		   return;
	   var res = eval(data);
	   socket.emit('evalResponse',res);
   });

});

//update and send deltas
setInterval(function(){
	
	var playerPack = []; // an array of player data for this frame	
	for (i in lobby.playerList)
	{
		var player = lobby.playerList[i]
	 	player.tick();
	 	var updatePacket = player.updatePacket()
	 	if (updatePacket != null){
	 		playerPack.push(updatePacket);
	 	}
	}

	if (playerPack.length == 0) {
		return;
	}
	Util.broadcast('update', {players: playerPack});
}, 1000/25);
