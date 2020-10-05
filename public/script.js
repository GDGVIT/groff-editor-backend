var socket = io.connect('http://localhost:3000/');

// Query DOM

const command = document.getElementById("command");
const btn = document.getElementById("send");
const output = document.getElementById("render");

// Emit events

btn.addEventListener("click", function(){
    var val = {
        token: process.env.TEST_TOKEN, 
        user_id: "5f474666872d6a141f53da20", //dummy id
        fileName: "sampletext.txt", // dummy filename
        data: command.value 
    }
    socket.emit("cmd", JSON.stringify(val));
});

socket.on('cmd', function(text){
    output.innerHTML += `<pre style="color: white;">${text}</pre>`;
    console.log(text);
});
