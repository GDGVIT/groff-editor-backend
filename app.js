const express = require("express");
const app = express();
const bp = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
const port = 3000||process.env.PORT;
const {
    exec
} = require("child_process");
const loginRoute = require("./Login/routes/login");
const oAuthRoute = require("./Login/routes/oAuth");
const searchRoute = require("./Login/routes/search");

dotenv.config();

// middle-wares

app.use(morgan("dev"));
app.use(express.static('public'));
app.use(bp.urlencoded({
    extended: false
}));
app.use(bp.json());
app.use(cors());


// var fs = require('fs');
// var Grid = require('gridfs-stream');
// var GridFS = Grid(mongoose.connection.db, mongoose.mongo);

// function putFile(path, name, callback) {
//     var writestream = GridFS.createWriteStream({
//         filename: name
//     });
//     writestream.on('close', function (file) {
//       callback(null, file);
//     });
//     fs.createReadStream(path).pipe(writestream);
// }


// mongo db

mongoose.set('useCreateIndex', true);
mongoose.connect(
   'mongodb+srv://groff:' +
   process.env.MONGO_PASS +
   '@cluster0-jtj9m.mongodb.net/pragati?retryWrites=true&w=majority', {
       useNewUrlParser: true,
       useUnifiedTopology: true
   },
);

// listen port

const server = app.listen(port, function () {
    console.log("Server started");
});

// routes

app.use('/auth', oAuthRoute);
app.use('/manauth', loginRoute);
app.use('/search', searchRoute);

// web socket[handle incoming req]

let child;
var io = socket(server);
io.on('connection', (person) => {

    console.log(`made socket connection : ${person.id}`);

    person.on("cmd", function (val) {

        let command = 'printf "' + val + '"';

        child = exec(`${command} | groff -i -ms -T html`, (err, stdout, stderr) => {
            if (err) {
                console.log(`Error: ${err.message}`);
            }
            if (stderr) {
                console.log(`Error: ${stderr}`);
            }
            console.log(stdout)
            person.emit('cmd', stdout);
        });
    });
}); 

