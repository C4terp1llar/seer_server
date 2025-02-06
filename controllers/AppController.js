const baseAPI = require("../utils/baseAPI");
const AuthService = require("../service/AuthService");
const AppService = require("../service/AppService");
const JiraService = require("../service/JiraService");

class AppController {

    async getUser(req, res) {
        try {
            const user = await AuthService.getUserById(req.uid);
            res.status(200).json({user});
        } catch (err) {
            return res.status(500).json({ error: "Ошибка при получении информации о пользователе" });
        }
    }

    async getProjects(req, res) {
        try {
            const {status, data} = await JiraService.getProjects(req.headers)

            if (status === 200 && data) {
                return res.status(200).json({projects: data});
            }else {
                return res.status(status).json({ error: "Ошибка при получении проектов"});
            }
        } catch (err) {
            return res.status(500).json({ error: "Ошибка при получении проектов" });
        }
    }

    async setProject(req, res) {
       const {project} = req.body;

       if (typeof project !== 'string' && project !== null) return res.status(400).json({error: 'Нехватает данных или данные некорректны'});

        try {
            const data = await AppService.setProject(req.uid, project)
            const qwe = await JiraService.getIssuesTypes(req.headers, 'SEER')
            console.log(qwe)
            res.status(200).json({user: data});
        } catch (err) {
            return res.status(500).json({ error: "Ошибка при выборе проекта" });
        }
    }

    async getIssuesTypes(req, res) {
        try {
            const {status, data} = await JiraService.getIssuesTypes(req.headers)

            if (status === 200 && data) {
                return res.status(200).json({issues: data});
            }else {
                return res.status(status).json({ error: "Ошибка при получении типов задач"});
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Ошибка при получении типов задач" });
        }
    }
}

module.exports = new AppController();
