const mongoose = require("mongoose");

const JqlQuerySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    fields: {
        type: [String],
        default: []
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    }
}, {timestamps: true});

const JqlQuery = mongoose.model("JqlQuery", JqlQuerySchema, "JqlQueries");

module.exports = JqlQuery;
