const baseAPI = require("../utils/baseAPI");

class AuthController {

    async login(req, res) {
        const { username, password } = req.query;

        if (!username || !password) {
            return res.status(400).json({ error: "Нехватает данных или данные некорректны" });
        }

        try {
            const token = Buffer.from(`${username}:${password}`).toString("base64");

            const response = await baseAPI.post(
                "rest/auth/1/session",
                { username, password },
                {
                    headers: {
                        "X-Atlassian-Token": "no-check",
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            let cookies = {};
            if (response.status === 200 && response.headers["set-cookie"]) {
                response.headers["set-cookie"].forEach((cookie) => {
                    const [cookieName, cookieValue] = cookie.split(";")[0].split("=");
                    if (cookieName === "atlassian.xsrf.token" || cookieName === "JSESSIONID") {
                        cookies[cookieName] = cookieValue;
                    }
                });
            }

            res.status(200).json({
                message: "Авторизация успешна",
                cookies,
                data: response.data
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Ошибка при авторизации" });
        }
    }

    async logout (req, res) {
        try {



        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при логауте' });
        }
    }

    async checkAuth (req, res) {
        try {
            const response = await baseAPI.get('/rest/auth/1/session', {
                headers: req.headers,
            })

            res.status(200).json({...response.data});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при проверке авторизации' });
        }
    }

}

module.exports = new AuthController();