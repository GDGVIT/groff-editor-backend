const express = require("express");
const app = express();
const bp = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const morgan = require("morgan");
const socket = require("socket.io");
// const ss = require("socket.io-stream");
const stream = require("stream");
const fs = require("fs");
const btoa = require("btoa");
const bash = require("bash");

// const WebSocket = require("ws");

const { exec, execFile, spawn } = require("child_process");
const { check, validationResult } = require("express-validator");

// var data = "";
const loginRoute = require("./Login/routes/login");
const oAuthRoute = require("./Login/routes/oAuth");
const previewRoute = require("./Login/routes/preview");
const authTestRoute = require('./Login/routes/authTest');
const { User } = require("./Login/models/model");

const port = process.env.BACKEND_PORT || 3000;

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

app.get("/ping", (_req, res) => {
	res.json({ Health: "Ok" });
});


const axios = require('axios');
const requestIp = require('request-ip');

app.use(requestIp.mw())



// mongo db

mongoose.set("useCreateIndex", true);
mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

// listen port

const server = app.listen(port, function () {
	console.log(`Server started at ${port}`);
});

// routes

app.use("/api/auth", oAuthRoute);
app.use("/api/manauth", loginRoute);
app.use("/api/preview", previewRoute);
app.use("/",authTestRoute);

let child;

var io = socket(server, {path: '/api/socket.io'});

io.origins("*:*");
io.on("connection", (person) => {
	console.log(`made socket connection : ${person.id}`);

	person.on("cmd", async (val) => {

		let val_json = JSON.parse(val);
		let token = val_json.token;
		let fileName = val_json.fileId;
		let data = val_json.data;
		console.log(val_json);
		let email = '';
		try {

			let user = await jwt.verify(token, process.env.JWT_KEY);
			console.log(user);
			email = user.email;
			console.log(email);
		} catch (err) {
			console.log(err);
			return
		}
			User.find({
				email: email
			}).then((doc) => {
				if(doc.length>=1){
					let timestamps = {
						updatedAt: new Date(),
					};

					console.log(fileName);
					User.updateOne(
						{
							_id: doc._id,
							"files.fileId": fileName,
						},
						{
							$set: {
								"files.$.fileData": data,
								"files.$.timestamps": timestamps,
							},
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

					child = execFile(
			            "pdfroff",
			            ["-i", "-ms", `--pdf-output=media/${doc[0]._id}.pdf`],
			            (err) => {
			                if (err) {
			                    console.log(err);
			                } else {
			                    fs.readFile(`media/${doc[0]._id}.pdf`, "binary", (err, data) => {
			                        if (err) {
			                            return console.log("Error:" + err);
			                        }
			                        let buff = btoa(data);
			                        person.emit("cmd", buff);
			                    });
			                }
			            }
			        );

			        var stdinStream = new stream.Readable();
			        stdinStream.push(data);
			        stdinStream.push(null);
			        stdinStream.pipe(child.stdin);

				} else {
					console.log("");
				}
			}).catch(err => {
			console.log(err)
			});
		})

	});
