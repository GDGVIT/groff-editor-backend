const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { User } = require("../models/model.js");
const mongoose = require("mongoose");

const path = require('path');
const mime = require('file-type');
const stream = require('stream');
const fs = require("fs");
const path = require("path");
let filePath;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

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

function decode(token){
  const decodedToken = jwt.decode(token, {
  complete: true
 });
  return decodedToken.payload.userId;
}

// download pdf

// function getStdout(){

// }

// router.get('/download', [check("Authorization")], authenticateJWT, async (req, res) => {

//   const stdout = getStdout();
//   const filename = "whatever.pdf";
//   const filestream = new stream.PassThrough();
//   filestream.end(stdout);

//   res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//   res.setHeader('Content-type', 'application/pdf');

//   filestream.pipe(res);
// });

router.get('/download', [check("Authorization")], authenticateJWT, async (req, res) =>{

  const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }

    const token = req.header("Authorization");
    let email;
    try {
      email = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      console.log(err);
      return res.status(403).json({
        message: err,
      });
    }

    let userId = decode(token);

    filePath=path.resolve(`./${userId}`);

    res.download(filePath, 'my-project.pdf', (err)=>{
      if(err){
        console.log(err);
        res.status(404).json({
          message: "requsted file not found"
        });
      }else{
        res.status(200).json({
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

  let userId = decode(token);
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

    const token = req.header("Authorization");
    let email;
    try {
      email = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      console.log(err);
      return res.status(403).json({
        message: err,
      });
    }

    let id = decode(token);
    let fileId = new mongoose.Types.ObjectId();
    let fileName = req.body.fileName;
    let fileData = "";

    User.updateOne(
      {
        _id: id,
      },
      {
        $push: {
          files: {
            _id: fileId,
            fileName: fileName,
            fileData: fileData,
          },
        },
      }
    )
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "File created",
          created: {
            _id: fileId,
            fileName: fileName,
            fileData: fileData,
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

    const token = req.header("Authorization");
    let email;
    try {
      email = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      console.log(err);
      return res.status(403).json({
        message: err,
      });
    }

    let newFileName = req.body.newFileName;
    let id = decode(token);
    let fileId=req.body.fileId;
      
    User.find({
      _id: id, 
      "files._id": fileId
    }).exec().then((result)=>{
      
        let filter={
          _id: id,
          "files._id": fileId
        };

        let update={
          $set: {
            "files.$.fileName": newFileName
          }
        }

       User.findOneAndUpdate(filter, update).exec()
      .then((result) => {
        res.status(200).json({
          message: "Filename updated",
          created: {
            result: result
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });


    }).catch((err)=>{
      console.log(err);
    });

  }
);

// get one file for a user : 

// const escapeRegex = function(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
//   }

// router.get("/searchFile", [check("Authorization")], authenticateJWT, (req, res) => {
//   const error = validationResult(req);
//   if (!error.isEmpty()) {
//     return res.status(422).json({
//       error: error.array(),
//     });
//   }

//   const token = req.header("Authorization");
//   let email;
//   try {
//     email = jwt.verify(token, process.env.JWT_KEY);
//   } catch (err) {
//     console.log(err);
//     return res.status(403).json({
//       message: err,
//     });
//   }

//   // const regex = new RegExp(escapeRegex(req.params.fileName), 'gi');

//   const fileId = req.body.fileId;
//   const id = req.body.userId;
//   User.find({
//     _id: id,
//     "files.fileId": fileId,
//   })
//     .select("files")
//     .exec()
//     .then((doc) => {
//       console.log(doc);
//       if (doc) {
//         res.status(200).json(doc);
//       } else {
//         res.status(404).json({
//           message: "No data saved for this file name",
//         });
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         err: err,
//       });
//     });
// });


// delete a file

router.delete("/deleteFile", [check("Authorization"), check("fileName")], authenticateJWT, (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }

  const token = req.header("Authorization");
  let email;
  try {
    email = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      message: err,
    });
  }

  const id = decode(token);
  const fileId = req.body.fileId;
  User.updateOne(
    {
      _id: id,
    },
    {
      "$pull": {
        "files":{
          "_id": fileId
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
