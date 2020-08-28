const express = require("express");
const app = express();
const bp = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
const port = process.env.PORT||3000;
const fs = require("fs");
const {
    exec
} = require("child_process");
const { check, validationResult } = require("express-validator");
const https = require('https');

var data = '';
const loginRoute = require("./Login/routes/login");
const oAuthRoute = require("./Login/routes/oAuth");
const searchRoute = require("./Login/routes/search");
const Search = require("./Login/models/search");

dotenv.config();

// middle-wares

app.use(morgan("dev"));
app.use(express.static('public'));
app.use(bp.urlencoded({
    extended: false
}));
app.use(bp.json());
app.use(cors());

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

// routes

app.use('/auth', oAuthRoute);
app.use('/manauth', loginRoute);
app.use('/search', searchRoute);

// web socket[handle incoming req]

let child;

const privateKey  = fs.readFileSync('./certs/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const httpsServer = https.createServer({key: privateKey, cert: certificate}, app);
const server = httpsServer.listen(process.env.SSL_PORT || 443);
console.log("Listening on HTTPS");

var io = socket(server);
io.on('connection', (person) => {

    console.log(`made socket connection : ${person.id}`);

    person.on("cmd", function (val) {
        
        let val_json = JSON.parse(val);
        
        let token = val_json.token;
        let user_id = val_json.userid;
        let fileNum = val_json.fileNum;
        let fileName = val_json.fileName;
        let data = val_json.data;
        let email;
        try {
            email = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            console.log(err);
            return res.status(403).json({
                message: err
            });
        }
        Search.update({

        });

        // Search.findById(user_id).

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
