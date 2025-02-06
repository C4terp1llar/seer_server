const baseAPI = require("../utils/baseAPI");
const User = require("../models/UserModel");

class AuthService {

    async loginJira(username, password, token) {
        try {

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

            return {status: response.status, data: response.data, cookies}
        } catch (err) {
            console.log(err.response.data)
            return {status: err.response.status, data: null, cookies: null}
        }
    }

    async getUserJiraInfo(cookies) {
        try {
            const headers = {
                Cookie: `atlassian.xsrf.token=${cookies['atlassian.xsrf.token']}; JSESSIONID=${cookies['JSESSIONID']}`
            };

            const response = await baseAPI.get("rest/api/2/myself", { headers: headers});

            return {
                status: response.status,
                data: {
                    email: response.data.emailAddress,
                    name: response.data.name,
                    fullName: response.data.displayName,
                    avatar: response.data.avatarUrls['48x48'],
                }
            };
        } catch (err) {
            console.log(err.response.data)
            return {status: err.response.status, data: null}
        }
    }

    async getUser(email) {
        try {
            return await User.findOne({email}).select('-__v').lean()
        } catch (err) {
            console.error('Ошибка при поиске пользователя', err)
            throw err
        }
    }

    async getUserById(uid) {
        try {
            return await User.findById(uid).select('-__v').lean()
        } catch (err) {
            console.error('Ошибка при поиске пользователя', err)
            throw err
        }
    }

    async createUser(userData) {
        try {
            return await User.create(userData);
        } catch (err) {
            console.error('Ошибка при создании пользователя', err)
            throw err
        }
    }

}

module.exports = new AuthService();