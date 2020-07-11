var socket = io.connect('http://localhost:3000');

// Query DOM

const command = document.getElementById("command");
const btn = document.getElementById("send");
const output = document.getElementById("render");

// Emit events

btn.addEventListener("click", function(){
    socket.emit("cmd", command.value);
});

socket.on('cmd', function(text){
    output.innerHTML += `<p style="color: white;">${text}</p>`;
    console.log(text);
});
