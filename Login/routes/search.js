const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Search = require("../models/search.js");

router.get('/:userId', [check("Authorization")], (req, res) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).json({
            error: error.array()
        });
    }
    let  userId = req.params.userId;
    Search.findById({
        userId: userId
    }).select("fileName file")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                searches: docs.map(doc => {
                    return {
                        fileName: doc.fileName,
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

router.post("/:userId/createFile",
    [
        check("fileName"),
        check("Authorization")
    ], (req, res) => {
        console.log(req.body);

        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({
                error: error.array()
            });
        }

        const token = req.header("Authorization");
        let email;
        try {
            email = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            console.log(err);
            return res.status(403).json({
                message: err
            });
        }

        const search = new Search({
            _id: new mongoose.Types.ObjectId(),
            userId: ureq.params.userId,
            fileName: req.body.fileName,
            file: ""
        });
        search.save().then(result => {
            console.log(result);
            res.status(201).json({
                message: "File created",
                fileName: search.fileName
            });
        }).catch(err => {
            console.log(err);
        });
    });

router.get("/:userId&:searchId",
    [check("Authorization")],
    (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({
                error: error.array()
            }); 
        }
        const id = req.params.searchId;
        const userId = req.params.userId;
        Search.findById(id).select("fileNum file")
            .exec().then(doc => {
                console.log(doc);
                if (doc) {
                    res.status(200).json({
                        doc: doc
                    });
                } else {
                    res.status(404).json({
                        message: "No valid id"
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

module.exports = router;


router.patch("/:searchId",
    [check("Authorization")], (req, res) => {

        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({
                error: error.array()
            });
        }

        const token = req.header("Authorization");
        let isValid = false;
        let email;
        try {
            email = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            console.log(err);
            return res.status(403).json({
                message: err
            });
        }
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
