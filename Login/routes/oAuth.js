const express = require("express");
const router = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/model.js");
const jwt = require("jsonwebtoken");
dotenv.config();

async function getAccessTokenFromCode(code) {
  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/auth/google",
      grant_type: "authorization_code",
      code,
    },
  });
  console.log(data); // { access_token, expires_in, token_type, refresh_token }
  return data.access_token;
}

async function getGoogleDriveFiles(access_token) {
  const { data } = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  console.log(data); // { id, email, given_name, family_name }
  return data;
}

router.get("/google", async (req, res) => {
  try {
    let token = await getAccessTokenFromCode(req.query.code);
    console.log(token);
    let data = await getGoogleDriveFiles(token);
    let mail = data.email;
    let token1;
    let user = await User.find({
      email: mail,
    }).exec();

    if (user.length >= 1) {
      token1 = jwt.sign(
        {
          email: user[0].email,
          userId: user[0]._id,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({
        message: "Auth successful",
        token: token1,
      });
    } else {
      const useri = new User({
        _id: new mongoose.Types.ObjectId(),
        email: mail,
      });
      useri.save().then((result) => {
        res.status(201).json({
          message: "User created",
          id: useri._id,
        });
      });
      token1 = jwt.sign(
        {
          email: useri.email,
          userId: useri._id,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({
        message: "Auth successful",
        token: token1,
        id: useri._id,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
