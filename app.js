const express = require("express");
const app = express();
const router = express.Router();
const bp = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
const {
    exec
} = require("child_process");

dotenv.config();

mongoose.set('useCreateIndex', true);
mongoose.connect(
    'mongodb+srv://groff:' +
    process.env.MONGO_PASS +
    '@cluster0-jtj9m.mongodb.net/pragati?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
);

const server = app.listen("3000", function () {
    console.log("Server started");
});

// -----------middle-wares-----------
app.use(morgan("dev"));
app.use(express.static('public'));
app.use(bp.urlencoded({
    extended: false
}));
app.use(bp.json());
app.use(cors());

// ------------web socket[handle incoming req]-----------

let child, output;
var io = socket(server);
io.on('connection', (person) => {

    console.log(`made socket connection : ${person.id}`);

    person.on("cmd", function (val) {

        let command = 'echo "' + val + '"';

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

        // child.stdout.on('data', (data) => {
        //     console.log(`child stdout:\n${data}`);
        // }); 
    });
}); 
