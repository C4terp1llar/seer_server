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
            res.status(200).json({user: data});
        } catch (err) {
            return res.status(500).json({ error: "Ошибка при выборе проекта" });
        }
    }

    async getIssuesStats(req, res) {
        const {project} = req.query;

        if (!project && !req.jiraData.project) return res.status(400).json({error: 'Нехватает данных или данные некорректны'});

        try {
            const {status, data} = await JiraService.getIssuesStats(req.headers, project || req.jiraData.project)

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

    async checkJqlQuery(req, res) {
        const { jqlQuery } = req.body;

        if (!jqlQuery) return res.status(400).json({error: 'Нехватает данных или данные некорректны'});

        try {
            const { status, message } = await JiraService.checkJqlQuery(req.headers, req.uid, jqlQuery);

            if (status === 200) {
                return res.status(200).json({ message });
            } else {
                return res.status(status).json({ error: message });
            }

        } catch (err) {
            console.error("Ошибка при проверке JQL запроса");
            return res.status(500).json({ error: "Ошибка при проверке JQL запроса" });
        }
    }

    async createJqlQuery(req, res) {
        const { name, query } = req.body;

        if (!name || !query) return res.status(400).json({ error: 'Необходимо указать имя и запрос' });

        try {
            const newQuery = await AppService.createJqlQuery(req.uid, name, query, req.headers);
            return res.status(201).json({ query: newQuery });
        } catch (err) {
            console.error('Ошибка при создании JQL запроса');
            return res.status(500).json({ error: 'Ошибка при создании JQL запроса' });
        }
    }

    async deleteJqlQuery(req, res) {
        const { queryId } = req.params;

        if (!queryId) return res.status(400).json({ error: 'Необходимо указать id запроса' });

        try {
            const result = await AppService.deleteJqlQuery(req.uid, queryId);
            return res.status(200).json(result);
        } catch (err) {
            console.error('Ошибка при удалении JQL запроса');
            return res.status(500).json({ error: 'Ошибка при удалении JQL запроса' });
        }
    }

    async getJqlQueries(req, res) {
        const { page = 1, limit = 25 } = req.query;

        try {
            const { queries, hasMore } = await AppService.getJqlQueries(req.uid, +page, +limit);
            return res.status(200).json({ queries, hasMore });
        } catch (err) {
            console.error('Ошибка при получении JQL запросов');
            return res.status(500).json({ error: 'Ошибка при получении JQL запросов' });
        }
    }

    async getJqlQuery(req, res) {
        const { queryId } = req.params;

        if (!queryId) return res.status(400).json({ error: 'Необходимо указать id запроса' });

        try {
            const query = await AppService.getJqlQueryById(req.uid, queryId);
            return res.status(200).json({ query });
        } catch (err) {
            console.error('Ошибка при получении JQL запроса');
            return res.status(500).json({ error: 'Ошибка при получении JQL запроса' });
        }
    }

}

module.exports = new AppController();
