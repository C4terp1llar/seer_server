const jwt = require('jsonwebtoken');

class JwtService {
    constructor() {
        this.tokenSecret = process.env.JWT_SECRET;
    }

    createToken(payload, expiresIn = '15d') {
        return jwt.sign(payload, this.tokenSecret, { expiresIn });
    }

    verifyToken(token) {
        return jwt.verify(token, this.tokenSecret)
    }
}

module.exports = new JwtService();