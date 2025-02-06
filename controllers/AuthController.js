const baseAPI = require("../utils/baseAPI");
const AuthService = require("../service/AuthService");
const JwtService = require("../service/JwtService");

class AuthController {

    async login(req, res) {
        const { username, password } = req.query;

        if (!username || !password) {
            return res.status(400).json({ error: "Нехватает данных или данные некорректны" });
        }

        try {
            const authToken = Buffer.from(`${username}:${password}`).toString("base64");

            const {status, data, cookies} = await AuthService.loginJira(username, password, authToken)

            if (status !== 200 || !cookies) {
                return res.status(status).json({message: 'Неверный логин или пароль'});
            }

            const userJiraInfo = await AuthService.getUserJiraInfo(cookies)

            let currentUser = await AuthService.getUser(userJiraInfo.data.email);

            if (!currentUser) {
                currentUser = await AuthService.createUser(userJiraInfo.data);
            }

            const userToken = JwtService.createToken({
                email: currentUser.email,
                uid: currentUser._id.toString(),
                cookies: cookies
            })

            res.status(200).json({
                message: `Авторизация успешна! Добро пожаловать, ${currentUser.name}`,
                token: userToken,
                user: {
                    email: currentUser.email,
                    name: currentUser.name,
                    fullName: currentUser.fullName,
                    avatar: currentUser.avatar,
                    selectedProject: currentUser.selectedProject,
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Ошибка при авторизации, попробуйте позже" });
        }
    }

    async checkAuth (req, res) {
        try {
            res.status(200).json({message: 'ok'});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при проверке авторизации' });
        }
    }

}

module.exports = new AuthController();