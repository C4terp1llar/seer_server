const JwtService = require("../service/JwtService");
const AuthService = require("../service/AuthService");
const baseAPI = require("../utils/baseAPI");

const cookieMiddleware = async (req, res, next) => {
    const token = req.cookies["token"];

    if (!token) {
        return res.status(401).json({ error: "Не авторизован: отсутствуют необходимые куки" });
    }

    try {
        const {email, uid, cookies} = JwtService.verifyToken(token);

        req.uid = uid;
        req.email = email;
        req.headers["Cookie"] = `JSESSIONID=${cookies['JSESSIONID']}; atlassian.xsrf.token=${cookies['atlassian.xsrf.token']}`;

        const [userData, jiraSessionData] = await Promise.all([
            AuthService.getUserById(uid),
            baseAPI.get('/rest/auth/1/session', {headers: {"Cookie": `JSESSIONID=${cookies['JSESSIONID']}; atlassian.xsrf.token=${cookies['atlassian.xsrf.token']}`}})
        ])

        if (jiraSessionData.status !== 200 || !userData){
            return res.status(401).json({ error: "Не авторизован: куки недействителены или пользователь не существует" });
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Не авторизован: токен недействителен" });
    }
};

module.exports = cookieMiddleware;
