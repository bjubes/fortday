var Util = require('./utilities.js')

// list of all lobbies on the server
var lobbyList = [];

class Lobby {
    constructor(length, width){
        this.socketList = []
        this.playerList = {}
        this._itemDropList = {} // items that are on the ground, NOT in players inventories
        
        lobbyList.push(this);
    }

    broadcast(msg,data){
        for (var i = this.socketList.length - 1; i >= 0; i--) {
            var obj = this.socketList[i]
            obj(msg,data)
        }
       
    }

    static getPlayerFromSocket(socket) {
        return getPlayerFromId(socket.id);
    }

    static getPlayerFromId(id){
        for (var i = 0; i < lobbyList.length; i++) {
            var plist = lobbyList[i].playerList
            for(var key in plist) {
                if ( plist[key].id == id){
                    return plist[key];
                }
            }
        }
        return null;
    }

    sendNewPlayerItems(socket, newPlayer=true){
        if (newPlayer){
            // rememer the new players socket
            this.socketList.push(function(msg,data){socket.emit(msg,data)})
        }
        //they need to know about all of the itemdrops.
        socket.emit("newItemDrop",this._itemDropList)
    }

    getItemDrop(id){
        return this._itemDropList[id]
    }

    addDropItem(itemDrop){
        //make up a new id
        var id = Util.generateId()
        this._itemDropList[id] = itemDrop
        var data = {}
        data[id] = itemDrop
        this.broadcast('newItemDrop', data) //check this is how to properly send this
    }

    removeDropItemViaID(id){
        delete this._itemDropList[id]
        //tell the players this item is gone now.
        this.broadcast("deleteItemDrop", id)
    }

    onPlayerMoved(player) {
        //unused
    }

    removePlayer(player) {
        //unused
    }
}


module.exports = Lobby;
