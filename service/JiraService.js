const baseAPI = require("../utils/baseAPI");
const User = require("../models/UserModel");
const JqlQuery = require("../models/JqlQueryModel");

class JiraService {

    async getProjects(headers) {
        try {
            const response = await baseAPI.get("rest/api/2/project", { headers: headers});

            const projects = response.data.map((p) => {
                return p.key;
            });

            return {status: response.status, data: projects}
        } catch (err) {
            console.log(err.response.data)
            return {status: err.response.status, data: null}
        }
    }

    async getIssuesStats(headers, project) {
        try {
            const queries = {
                total: `project=${project}`,
                in_work: `project=${project} AND status IN ("In Progress")`,
                accepted: `project=${project} AND status IN ("Done")`,
                to_do: `project=${project} AND status IN ("To Do")`,
                errors: `project=${project} AND issuetype="Bug"`
            };

            const endpoints = Object.entries(queries).map(([key, jql]) =>
                baseAPI.get(`/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=0`, { headers })
                    .then(response => ({ [key]: response.data.total }))
                    .catch(err => ({ [key]: 0 }))
            );

            const results = await Promise.all(endpoints);

            return {status: 200, data: Object.assign({}, ...results)};
        } catch (err) {
            console.error("Ошибка при получении статистики по задачам:", err.response?.data || err.message);
            return { status: err.response?.status || 500, data: null };
        }
    }

    async checkJqlQuery(headers, uid, jqlQuery) {
        try {
            const existingQuery = await JqlQuery.findOne({ user: uid, query: jqlQuery });

            if (existingQuery) {
                return { status: 400, message: "Этот запрос уже существует." };
            }

            await baseAPI.get(`/rest/api/2/search?jql=${encodeURIComponent(jqlQuery)}&maxResults=0`, { headers });

            return { status: 200, message: "Запрос корректен!" };
        } catch (err) {
            console.error("Ошибка при проверке JQL запроса:", err.response?.data || err.message);
            return { status: err.response?.status || 500, message: "Ошибка при проверке запроса." };
        }
    }



}

module.exports = new JiraService();