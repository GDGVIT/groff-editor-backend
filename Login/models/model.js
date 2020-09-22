const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fileName: {type: String, required: true, default: "untitled" },
    fileData: {type: String, default: ""}
});

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    },
    password: {
        type: String,
        min: 6,
        max: 30
    },
    files: [fileSchema]
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.File = mongoose.model('File', fileSchema);
