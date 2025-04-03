const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    day: {
        type: Date,
        required: true
    },
    time_from: {
        type: String,
        required: true
    },
    time_to: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    color: {
        type: String,
        required: false,
        default: "#123321"
    }
}, { timestamps: true });

EventSchema.index({ user: 1, day: 1, time_from: 1, time_to: 1 }, { unique: true });
EventSchema.index({ user: 1, day: 1, title: 1 }, { unique: true });

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
