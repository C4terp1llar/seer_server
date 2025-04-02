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
            const today = new Date();
            const startOfSprint = new Date(today.getFullYear(), today.getMonth(), 1); // нч спринта, 1-ое число текущего месяца
            const endOfSprint = new Date(today.getFullYear(), today.getMonth() + 1, 1);  // кц спринта, 1-ое число след месяца

            const startDate = startOfSprint.toISOString().split('T')[0];
            const endDate = endOfSprint.toISOString().split('T')[0];

            const queries = {
                total: `project=${project} AND created >= "${startDate}" AND created < "${endDate}"`,
                in_work: `project=${project} AND status IN ("На проверке QA") AND created >= "${startDate}" AND created < "${endDate}"`,
                accepted: `project=${project} AND status IN ("Done") AND created >= "${startDate}" AND created < "${endDate}"`,
                to_do: `project=${project} AND status IN ("To Do") AND created >= "${startDate}" AND created < "${endDate}"`,
                errors: `project=${project} AND issuetype="Bug" AND created >= "${startDate}" AND created < "${endDate}"`
            };

            const endpoints = Object.entries(queries).map(([key, jql]) =>
                baseAPI.get(`/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=0`, { headers })
                    .then(response => ({ [key]: response.data.total }))
                    .catch(err => ({ [key]: 0 }))
            );

            const results = await Promise.all(endpoints);
            console.log(results)

            return { status: 200, data: Object.assign({}, ...results) };
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