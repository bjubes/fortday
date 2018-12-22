var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');


socket.on('addToChat',function(data){
   chatText.innerHTML += '<div><b>' + data.name + ':</b> ' + data.msg +'</div>';
   chatText.scrollTop = chatText.scrollHeight;
});
socket.on('evalResponse',function(data){
   console.log(data);
});


chatForm.onsubmit = function(e){
   e.preventDefault();
   if(chatInput.value[0] === '/')
	   socket.emit('evalServer',chatInput.value.slice(1));
   else
	   socket.emit('chatToServer',chatInput.value);
   chatInput.value = '';
}
