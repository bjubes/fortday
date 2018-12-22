var Util = {}

Util.randomColor = function(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

Util.broadcast = function(msg, data) {
    for(var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit(msg, data);
    }
}

Util.generateId = function(){
	//gen a number between 0 and 9 millon, and convert to alphanumeric
	return (0|Math.random()*9e6).toString(36)
}
module.exports = Util
