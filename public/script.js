var socket = io.connect('https://groff-backend.herokuapp.com/');

// Query DOM

const command = document.getElementById("command");
const btn = document.getElementById("send");
const output = document.getElementById("render");

// Emit events

btn.addEventListener("click", function(){
    socket.emit("cmd", command.value);
});

socket.on('cmd', function(text){
    output.innerHTML += `<pre style="color: white;">${text}</pre>`;
    console.log(text);
});
