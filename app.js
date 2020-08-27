const express = require("express");
const app = express();
const bp = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const { check, validationResult } = require("express-validator");

var data = "";
const loginRoute = require("./Login/routes/login");
const oAuthRoute = require("./Login/routes/oAuth");
const previewRoute = require("./Login/routes/preview");
const { User } = require("./Login/models/model");

dotenv.config();

// middle-wares

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(
  bp.urlencoded({
    extended: false,
  })
);
app.use(bp.json());
app.use(cors());

// mongo db

mongoose.set("useCreateIndex", true);
mongoose.connect(
  "mongodb+srv://groff:" +
    process.env.MONGO_PASS +
    "@cluster0-jtj9m.mongodb.net/pragati?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// listen port

const server = app.listen(port, function () {
  console.log("Server started");
});

// routes

app.use("/auth", oAuthRoute);
app.use("/manauth", loginRoute);
app.use("/preview", previewRoute);

// web socket[handle incoming req]

let child;
var io = socket(server);
io.on("connection", (person) => {
  console.log(`made socket connection : ${person.id}`);

  person.on("cmd", function (val) {
    let val_json = JSON.parse(val);

    let token = val_json.token;
    let user_id = val_json.user_id;
    let fileName = val_json.fileName;
    let data = val_json.data;
    let email;
    try {
      email = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      console.log(err);
    }
    User.updateOne(
      {
        _id: user_id,
        "files.fileName": fileName,
      },
      {
        $set: { "files.$.fileData": data },
      }
    )
      .exec()
      .then((result) => {
        console.log("File updated");
      })
      .catch((err) => {
        console.log(err);
      });

    let command = 'printf "' + data + '"';

    child = exec(`${command} | groff -i -ms -T html`, (err, stdout, stderr) => {
      if (err) {
        console.log(`Error: ${err.message}`);
      }
      if (stderr) {
        console.log(`Error: ${stderr}`);
      }
      // console.log(stdout)
      person.emit("cmd", stdout);
    });
  });
});
