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
const fs = require("fs");
const btoa = require("btoa");
const bash = require("bash");
// const WebSocket = require("ws");

const { exec, execFile } = require("child_process");
const { check, validationResult } = require("express-validator");

// var data = "";
const loginRoute = require("./Login/routes/login");
const oAuthRoute = require("./Login/routes/oAuth");
const previewRoute = require("./Login/routes/preview");
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

let child;
var io = socket(server,{path: '/api/socket.io'});
io.origins("*:*");
io.on("connection", (person) => {
	console.log(`made socket connection : ${person.id}`);

	person.on("cmd", function (val) {
		let val_json = JSON.parse(val);
		let token = val_json.token;
		let user_id = val_json.user_id;
		let fileName = val_json.fileId;
		let data = val_json.data;
		let email;

		try {
			email = jwt.verify(token, process.env.JWT_KEY);
		} catch (err) {
			console.log(err);
		}
		let timestamps = {
			updatedAt: new Date(),
		};
		console.log(fileName)
		User.updateOne(
			{
				_id: user_id,
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

		child = exec(
			`${command} | groff -i -ms -T pdf > "${user_id}.pdf"`,
			(err, stdout, stderr) => {
				fs.readFile(`${user_id}.pdf`, "binary", (err, data) => {
					if (err) {
						return console.log("Error:" + err);
					}
					let buff = btoa(data);
					person.emit("cmd", buff);
					// console.log(buff);
				});
				if (err) {
					console.log(`Error: ${err.message}`);
				}
				if (stderr) {
					console.log(`Error: ${stderr}`);
				}
			}
		);

		// child = execFile('printf', [data, "|", "groff", "-i", "-ms", "-T", "pdf", ">", `${userId}.pdf`],  (error, stdout, stderr) => {
		//   if (error) {
		//     throw error;
		//     console.log(error);
		//   }
		//   console.log(stdout);
		// });
	});
});
