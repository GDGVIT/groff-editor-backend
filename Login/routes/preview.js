const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { User, File } = require("../models/model.js");
const mongoose = require("mongoose");

const path = require('path');
const mime = require('file-type');
// const stream = require('stream');
const fs = require("fs");
let filePath;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (authHeader) {
        const token = authHeader;
        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


const authRoute = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (authHeader) {
        const token = authHeader;
        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            console.log(req.user);
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id,
              },
            process.env.JWT_KEY,
              {
                expiresIn: "60d",
              }
            );
            req.user.token = token;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

router.get("/checkJwt", authRoute,(req, res) => {
  console.log(req.user);
  return res.status(200).json({
    "email": req.user.email,
    "_id": req.user.userId,
    "token": req.user.token
  });
});

// to download files

router.get('/download', [check("Authorization")], authenticateJWT, async (req, res) =>{
  const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let userId = req.user.userId;

    filePath=path.resolve(`${process.cwd()}/${userId}.pdf`);

    res.download(filePath, 'my-project.pdf', (err)=>{
      if(err){
        console.log(err);
        return res.status(404).json({
          message: "requsted file not found"
        });
      }else{

        return res.status(200).json({
          message: "file served"
        });

      }
    });
});

// get all files for a user

router.get("/user", [check("Authorization")], authenticateJWT, (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }

  let userId = req.user.userId;
  User.find({ _id: userId })
    .select("files")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        searches: docs.map((doc) => {
          return {
            files: doc.files,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err.toString());
      res.status(500).json({
        err: err,
      });
    });
});

// create a new file

router.patch(
  "/createFile",
  [check("Authorization")], authenticateJWT,
  (req, res) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let id = req.user.userId;
    let fileId = new mongoose.Types.ObjectId();
    let fileName = req.body.fileName;
    let fileData = "This is a new file";
    let timestamps = {
      createdAt: new Date(),
      updatedAt: new Date()
    }

    User.updateOne(
      {
        _id: id,
      },
      {
        $push: {
          files: {
            fileId: fileId,
            fileName: fileName,
            fileData: fileData,
            timestamps: timestamps
          },
        },
      }
    )
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "File created",
          created: {
            fileId: fileId,
            fileName: fileName,
            fileData: fileData,
            timestamps: timestamps
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({
          err: err
        });
      });
  }
);

// rename a file

router.patch('/rename', [check("Authorization")], authenticateJWT,
  (req, res) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }

    let newFileName = req.body.newFileName;
    let id = req.user.userId;
    let fileId=req.body.fileId;

    let filter={
          _id: id,
          "files.fileId": fileId
    };

        let update={
          $set: {
            "files.$.fileName": newFileName
          }
        }
      User.findOneAndUpdate(filter, update, {
          new: true
        }).exec()
      .then((result) => {
        console.log(result);
        res.status(200).json({
          message: "Filename updated",

        });
      })
      .catch((err) => {
        console.log(err);
      });

  }
);

// get one file for a user : 

router.get("/getFile", [check("Authorization")], authenticateJWT, (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }

  const fileId = req.query.fileId;
  const id = req.user.userId;

  User.findOne({
    _id: id,
    "files.fileId": fileId,
  })
    .exec()
    .then((doc) => {
      if (doc) {
        const newDoc = doc.files.filter(file => file.fileId.toString() === fileId.toString());
        res.status(200).json(newDoc);
      } else {
        res.status(404).json({
          message: "No data saved for this file name",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        err: err,
      });
    });
});


// delete a file

router.delete("/deleteFile", [check("Authorization"), check("fileName")], authenticateJWT, (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }
  const id = req.user.userId;
  const fileId = req.body.fileId;
  User.updateOne(
    {
      _id: id,
    },
    {
      "$pull": {
        "files":{
          "fileId": fileId
        }
      },
    }
  )
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
