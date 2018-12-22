var loginDiv = document.getElementById('login');
var loginForm = document.getElementById('login-form')
var loginUsername = document.getElementById('login-username');
var gameDiv = document.getElementById('game');

var playerID = null

loginForm.onsubmit = function(e){
    e.preventDefault();
    socket.emit('login',{name:loginUsername.value});
    loginUsername.value = '';
}

socket.on('loginResponse',function(data){
    if(data.success){
        loginDiv.style.display = 'none';
        gameDiv.style.display = 'inline-block';
        playerID = data.id
    } else {
        alert("Sign in unsuccessul.");
    }
});
