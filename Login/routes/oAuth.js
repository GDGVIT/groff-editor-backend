const express = require("express");
const router = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const {User} = require("../models/model.js");
const jwt = require("jsonwebtoken");
const querystring = require('querystring')
const fetch = require('node-fetch')
const admin = require('../../firebase/firebase')

dotenv.config();

router.post("/google", async (req, res) => {
  try {
    let usr;
    try {
      usr = await admin.auth().verifyIdToken(req.body.idToken)
    } catch (e) {
      return res.status(403).send({code: 403, message: "invalid idtoken"})
    }
    let mail = usr.email;
    let user = await User.find({
      email: mail,
    });

    if (user.length >= 1) {
      token1 = jwt.sign(
        {
          email: user[0].email,
          userId: user[0].id,
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
    res.status(500).send({code: 500, message: "internal error occurred"})
  }
});

module.exports = router;
