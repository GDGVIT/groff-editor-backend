const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Search = require("../models/search.js");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/txt' || file.mimetype === 'text/ms') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', (req, res) => {
    Search.find()
        .select("fileNum file")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                searches: docs.map(doc => {
                    return {
                        fileNum: doc.fileNum,
                        file: doc.file
                    }
                })
            };
            res.status(200).json(response);
        }).catch(err => {
            res.status(500).json({
                err: err
            });
        });
});

router.post("/", upload.single("groffFile"), (req, res) => {
    console.log(req.file);
    const search = new Search({
        _id: new mongoose.Types.ObjectId(),
        fileNum: req.body.fileNum,
        file: req.file.path
    });
    search.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "Uploaded",
            fileNum: search.fileNum,
            createdFile: search
        });
    }).catch(err => {
        console.log(err);
    });
});

router.get("/:searchId", (req, res) => {
    const id = req.params.searchId;
    Search.findById(id).select("fileNum file").exec().then(doc => {
        console.log(doc);
        if(doc){
            res.status(200).json({
                doc: doc
            });
        }
        
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            err: err
        });
    });
});

router.delete("/:searchId", (req, res) => {
    const id = req.params.searchId;
    Search.remove({
        _id: id
    }).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch("/:searchId", (req, res) => {
    const id = req.params.searchId;
    const updateOps = {};
    console.log(req.body);
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
        console.log(updateOps[ops.propName]);
    }
    Search.update({
            _id: id
        }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Patched successfully",
                updated: updateOps
            });
        }).catch(err => {
            console.log(err);
        });
});

module.exports = router;