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
const {
    spawn
} = require("child_process");
const check = require("./middleware/check-auth");
const fetch = require('node-fetch');

dotenv.config();

// const orderRoute = require("./order/routes/routes");
// const userRoute = require("./Login/routes/login");

// const { google } = require('googleapis');

// const oauth2Client = new google.auth.OAuth2(
//     process.env.YOUR_CLIENT_ID,
//     process.env.YOUR_CLIENT_SECRET,
//     process.env.YOUR_REDIRECT_URL
// );

// // generate a url that asks permissions for email and 
// const scopes = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//     'openid'
// ];

// const url = oauth2Client.generateAuthUrl({
//     scope: scopes
// });



const server = app.listen("3000", function () {
    console.log("Server started");
});


mongoose.set('useCreateIndex', true);
mongoose.connect(
    'mongodb+srv://groff:' +
    process.env.MONGO_PASS +
    '@cluster0-jtj9m.mongodb.net/pragati?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },

);

// -----------middle-wares-----------
app.use(morgan("dev"));
app.use(express.static('public'));
app.use(bp.urlencoded({
    extended: false
}));
app.use(bp.json());
app.use(cors());
// app.use(check);

// ------------routes[handle incoming req]-----------

let child;
var io = socket(server);
io.on('connection', (person) => {

    console.log(`made socket connection : ${person.id}`);

    exec("groff -i ms -T html >> out.html", (err, stdout, stderr) => {
        if (err) {
            console.log(`Error: ${err.message}`);
        }
        if (stderr) {
            console.log(`Error: ${stderr}`);
        }
        console.log(stdout)
    });

    person.on("cmd", function (val) {
        child = spawn(val);
        child.stdout.on("data", (data)=>{
            console.log(data);
        });
    });
});

// app.use("/user", userRoute);