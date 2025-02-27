const mongoose = require("mongoose");

function checkIds(...ids) {
    if (ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        return { error: '400', status: 400, message: 'Некорректные id' };
    }
    return null;
}

module.exports = checkIds;