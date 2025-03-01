const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
