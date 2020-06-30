const express = require("express");
const app = express();
const bp = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
// const {exec}= require("child-process");
const check = require("./middleware/check-auth");

dotenv.config();

// const authRoute = require("./Login/routes/login");
const orderRoute = require("./order/routes/routes");
const userRoute = require("./Login/routes/login");

const server = app.listen("3000", function(){
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

var io = socket(server);
io.on('connection', (person) =>{
    
    console.log(`made socket connection : ${person.id}`); 

    exec("groff -i ms -T html >> out.html", (err,stdout,stderr)=>{
        if(err){
            console.log(`Error: ${err.message}`);
        }
        if(stderr){
            console.log(`Error: ${stderr}`);
        }
        console.log(stdout)
    });
    person.on("cmd", function(data){
        exec(data, (err,stdout,stderr)=>{
            if(err){
                console.log(`Error: ${err.message}`);
            }
            if(stderr){
                console.log(`Error: ${stderr}`);
            }
            console.log(stdout)
        });
        
        

    });
});

app.use("/user", userRoute);

