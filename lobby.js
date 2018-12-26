var Util = require('./utilities.js')

// list of all lobbies on the server
var lobbyList = [];

class Lobby {
    constructor(length, width){
        this.playerList = {}
        this.itemDropList = {} // items that are on the ground, NOT in players inventories
        
        lobbyList.push(this);
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

    sendNewPlayerItems(socket){
        //they need to know about all of the itemdrops.
        socket.emit("newItemDrop",this.itemDropList)
    }

    onPlayerMoved(player) {
        //unused
    }

    removePlayer(player) {
        //unused
    }
}


module.exports = Lobby;
