const mongoose = require("mongoose");

const searchSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: Number,
    fileName: {type:String},
    file: {type: String, required: true}
});

module.exports = mongoose.model('Search', searchSchema);
