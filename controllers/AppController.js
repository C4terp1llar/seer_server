const baseAPI = require("../utils/baseAPI");

class AppController {

    async getUser(req, res) {
        try {
            const response = await baseAPI.get("rest/api/2/myself", { headers: req.headers });
            res.status(200).json(response.data);
        } catch (err) {
            return res.status(500).json({ error: "Ошибка при получении информации о пользователе" });
        }
    }

    async getIssuesStats(req, res) {
        const {id} = req.params;

        if (!id) {
            return res.status(400).json({ error: "Ключ проекта не передан" });
        }

        try {
            const jql = `project = "${id}"`;

            const tps = await baseAPI.get("rest/api/2/issuetype", {
                headers: req.headers,
            });

            console.log(tps.data)

            const response = await baseAPI.get("rest/api/2/search", {
                headers: req.headers,
                params: {
                    jql: jql,
                    fields: 'issuetype',  // Получаем только тип задачи
                    maxResults: 1000,     // Ограничиваем количество задач
                }
            });

            // Статистика по задачам: считаем количество задач по типам
            const issues = response.data.issues;

            // Инициализируем объект для хранения типов задач
            let typeCounts = {};

            issues.forEach(issue => {
                const issueType = issue.fields.issuetype.name;

                // Если типа еще нет в объекте, добавляем его с начальным значением 1
                if (typeCounts[issueType]) {
                    typeCounts[issueType]++;
                } else {
                    typeCounts[issueType] = 1;
                }
            });

            // Формируем результат с общим количеством задач и количеством по типам
            const result = {
                issues: {
                    total: issues.length,    // Общее количество задач
                    ...typeCounts            // Количество задач по типам
                }
            };

            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Ошибка при получении задач из по проекту" });
        }
    }
}

module.exports = new AppController();
