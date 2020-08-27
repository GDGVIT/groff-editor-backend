var socket = io.connect('http://localhost:3000/');

// Query DOM

const command = document.getElementById("command");
const btn = document.getElementById("send");
const output = document.getElementById("render");

// Emit events

btn.addEventListener("click", function(){
    var val = {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwidXNlcklkIjoiNWY0NzQ2NjY4NzJkNmExNDFmNTNkYTIwIiwiaWF0IjoxNTk4NTA2NjMxLCJleHAiOjE1OTg1MTAyMzF9.2xlDLF3RN37BWBO172bEpNr1ydRH5DdSTGDSB4hjiLk",
        user_id: "5f474666872d6a141f53da20",
        fileName: "sampletext.txt",
        data: command.value
    }
    socket.emit("cmd", JSON.stringify(val));
});

socket.on('cmd', function(text){
    output.innerHTML += `<pre style="color: white;">${text}</pre>`;
    console.log(text);
});
