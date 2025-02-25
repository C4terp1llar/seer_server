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

    async checkJqlQuery(headers, uid, jqlQuery, fields) {
        try {

            const existingQuery = await JqlQuery.findOne({
                user: uid,
                query: { $regex: new RegExp(`^${jqlQuery.toLowerCase().trim()}$`, 'i') },
                fields: { $all: fields || [] }
            });

            if (existingQuery) {
                return { status: 400, data: null, message: "Этот запрос уже существует." };
            }

            const requestBody = {
                jql: jqlQuery,
                startAt: 0,
                maxResults: 1000,
                fields: fields || []
            };

            const response = await baseAPI.post(`/rest/api/2/search`, requestBody, { headers });

            if (fields && fields.length > 0) {
                requestBody.fields = fields;
                const fieldResponse = await baseAPI.post(`/rest/api/2/search`, requestBody, { headers });
                return { status: 200, data: fieldResponse.data, message: "Запрос корректен!" };
            } else {
                return { status: 200, data: { total: response.data.total }, message: "Запрос корректен!" };
            }

        } catch (err) {
            console.error("Ошибка при проверке JQL запроса:", err.response?.data || err.message);
            return { status: err.response?.status || 500, data: err.response?.data?.errorMessages || 'Некорректный JQL запрос', message: "Ошибка при проверке запроса." };
        }
    }


}

module.exports = new JiraService();