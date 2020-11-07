const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const { User } = require("../models/model.js");

router.post("/signup", (req, res) => {
  let mail = req.body.email;
  let pass = req.body.password;
  console.log(mail);
  User.find({
    email: req.body.email,
  })
    .exec()
    .then((useri) => {
      if(pass.length < 7){
        return res.status(422).json({
          message: "length of password should be greater than 6 letters"
        });
      }
      if (useri.length >= 1) {
        return res.status(409).json({
          message: "mail exists",
        });
      } else {

        const secret_key = process.env.SECRET_KEY;
        const token1 = req.body.token;
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token1}`;

        fetch(url, {
            method: 'post'
        })
            .then(response => response.json())
            .then(google_response => res.json({ google_response }))
            .catch(error => return res.json({ error }));

        bcrypt.genSalt(parseInt(process.env.NUM_HASH), function(err, salt) {
          bcrypt.hash(req.body.password, salt, function(err, hash) {
              if (err) {
                    return res.status(500).json({
                      error: err,
                    });
                  } else {
                    const user = new User({
                      _id: new mongoose.Types.ObjectId(),
                      email: req.body.email,
                      password: hash,
                    });
                    user.save().then((result) => {
                      const token = jwt.sign({
                            email: user.email,
                            userId: user._id,
                          },
                          process.env.JWT_KEY,
                          {
                            expiresIn: "2d",
                          }
                        );
                      res.status(201).json({
                        message: "User created",
                        userid: user._id,
                        token: token,
                      });
                    });
                 }
          });
      });
    }
  })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});


router.post("/login", (req, res) => {
  User.find({
    email: req.body.email,
  })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
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
            token: token,
            userid: user[0]._id,
          });
        }
        return res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
