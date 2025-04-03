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
        const { jqlQuery, fields } = req.body;

        if (!jqlQuery) return res.status(400).json({error: 'Нехватает данных или данные некорректны'});

        try {
            const checkSnap = await JiraService.checkJqlQuery(req.headers, req.uid, jqlQuery, fields);

            if (checkSnap.status === 200) {
                return res.status(200).json({ ...checkSnap });
            } else {
                return res.status(checkSnap.status).json({ ...checkSnap });
            }

        } catch (err) {
            console.error("Ошибка при проверке JQL запроса");
            return res.status(500).json({ error: "Ошибка при проверке JQL запроса" });
        }
    }

    async createJqlQuery(req, res) {
        const { name, query, fields } = req.body;

        if (!name || !query) return res.status(400).json({ error: 'Необходимо указать имя и запрос' });

        try {
            const newQuery = await AppService.createJqlQuery(req.uid, name, query, fields, req.headers);
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
            const result = await AppService.getJqlQueryById(req.uid, queryId);

            if (result.error) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(200).json({ query: result });
        } catch (err) {
            console.error('Ошибка при получении JQL запроса');
            return res.status(500).json({ error: 'Ошибка при получении JQL запроса' });
        }
    }

    async getNote(req, res) {
        try {
            const note = await AppService.getNote(req.uid);
            return res.status(200).json({ note });
        } catch (err) {
            console.error('Ошибка при получении заметки');
            return res.status(500).json({ error: 'Ошибка при получении заметки' });
        }
    }

    async createNote(req, res) {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Необходимо указать title и content' });
        }

        try {
            const note = await AppService.createNote(req.uid, title, content);
            return res.status(200).json({ note });
        } catch (err) {
            console.error('Ошибка при создании или обновлении заметки');
            return res.status(500).json({ error: 'Ошибка при создании или обновлении заметки' });
        }
    }

    async createEvent(req, res) {
        const { day, title, time_from, time_to, description, color } = req.body;

        if (!day  || !time_from  || !time_to || !title) {
            return res.status(400).json({ error: 'Необходимо указать day и time_from и time_to и title' });
        }

        try {
            const result = await AppService.createEvent(req.uid, title, day, time_from, time_to, description, color);

            if (result.error) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(201).json({ event: result.data });
        } catch (err) {
            console.error('Ошибка при создании события');
            return res.status(500).json({ error: 'Ошибка при создании события' });
        }
    }

    async getEventsByMonth(req, res) {
        try {
            const result = await AppService.getEventsByMonth(req.uid);
            return res.status(200).json({ schedule: result });
        } catch (err) {
            console.error('Ошибка при получении дат событий');
            return res.status(500).json({ error: 'Ошибка при получении дат событий' });
        }
    }

    async getEventsByDay(req, res) {
        const { day, page = 1, limit = 10} = req.query;

        if (!day) {
            return res.status(400).json({ error: "Необходимо указать day" });
        }

        try {
            const data = await AppService.getEventsByDay(req.uid, day, +page, +limit);
            return res.status(200).json({ ...data });
        } catch (err) {
            console.error("Ошибка при получении событий за день", err);
            return res.status(500).json({ error: "Ошибка при получении событий за день" });
        }
    }


}

module.exports = new AppController();
