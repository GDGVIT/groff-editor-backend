const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const { validateEmail , validatePassword } = require('../utils/validation')
const mongoose = require("mongoose");
const { User } = require("../models/model.js");
const fetch = require('node-fetch')

router.post("/signup", async (req, res) => {
  let { email, password,  token } = req.body;

  try {
      if (!validateEmail(email) || !validatePassword(password) || !token) {
          res.status(400).send({code: 400, message: "invalid email address or password"});
          return
      }
      let user = await User.find({ email })
      if (user.length > 0) {
          return res.status(409).json({
              message: "mail exists",
          })
          return
      }
      const secret_key = process.env.SECRET_KEY;
      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
      let recaptchaResponse = await fetch(url, {
          method: 'post'
      })

      let recaptchaResponseJSON = await recaptchaResponse.json()

      if (!recaptchaResponseJSON.success) {
          return res.status(403).send({code: 403, message: "recaptcha invalid"})
      }
      const hashCount = parseInt(process.env.NUM_HASH)
      const salt = await bcrypt.genSalt(hashCount)
      const passwordHash = await bcrypt.hash(password, salt)
      const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: passwordHash,
      });
      const jwtKey = process.env.JWT_KEY;
      await newUser.save();
      const jwtToken = jwt.sign({
              email: newUser.email,
              userId: newUser._id,
          },
          jwtKey,
          {
              expiresIn: "2d",
          }
      );
      res.status(201).json({
          message: "User created",
          userid: newUser._id,
          token: jwtToken,
      });

  } catch (e) {
      return res.status(500).send({code: 500, message: e.toString()})
  }
});


router.post("/login", async(req, res) => {
    let { email, password,  token } = req.body;

    try {
        if (!validateEmail(email) || !validatePassword(password) || !token) {
            res.status(400).send({code: 400, message: "invalid email address or password"});
            return
        }
        let user = await User.findOne({ email })
        const secret_key = process.env.SECRET_KEY;
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
        let recaptchaResponse = await fetch(url, {
            method: 'post'
        })

        let recaptchaResponseJSON = await recaptchaResponse.json()
        if (!recaptchaResponseJSON.success) {
            return res.status(403).send({code: 403, message: "recaptcha invalid"})
        }
        let authStatus = await bcrypt.compare(password, user.password);
        if(!authStatus) {
            return res.status(403).send({code: 403, message: "auth failed"})
        }
        const jwtKey = process.env.JWT_KEY;
        const jwtToken = jwt.sign({
                email: user.email,
                userId: user._id,
            },
            jwtKey,
            {
                expiresIn: "2d",
            }
        );
        res.status(200).json({
            message: "Auth successful",
            userid: user._id,
            token: jwtToken,
        });

    } catch (e) {
        return res.status(500).send({code: 500, message: e.toString()})
    }
});

module.exports = router;
