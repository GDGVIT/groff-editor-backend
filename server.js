const http = require("http");
const socket = require("socket.io");
const app = require("./app");
const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, ()=>{
    console.log("Server started");
});

app.use(express.static('public'));

var io = socket(server);
io.on('connection', (user)=>{
    console.log(`made socket connection : ${user.id}`);
    
});

