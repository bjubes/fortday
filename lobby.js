var Util = require('./utilities.js')

var lobbyList = [];

class Lobby {
    constructor(length, width){
        this.playerList = {}
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

    onPlayerMoved(player) {
        //unused
    }

    removePlayer(player) {
        //unused
    }
}


module.exports = Lobby;
