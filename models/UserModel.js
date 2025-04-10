const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,
        unique: true,
        match: /.+@.+\..+/
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    selectedProject: {
        type: String,
        required: false,
        default: null
    }
});

const User= mongoose.model('User', UserSchema);

module.exports = User;