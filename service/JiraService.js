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
            const baseFilter = `project=${project} AND created >= -30d`;

            const queries = {
                total: `${baseFilter}`,
                in_work: `${baseFilter} AND status IN ("In Progress")`,
                accepted: `${baseFilter} AND status IN ("Done")`,
                to_do: `${baseFilter} AND status IN ("To Do")`,
                errors: `${baseFilter} AND issuetype="Ошибка"`
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

    // async getHighPriorityIssues(headers, projectKey) {
    //     try {
    //         const jql = `project=${projectKey} AND priority in (High, Highest)`;
    //
    //         const response = await baseAPI.get(`/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=100`, { headers });
    //
    //         return { status: 200, data: response.data.issues };
    //     } catch (err) {
    //         console.error("Ошибка при получении задачи с высоким приоритетом:", err.response?.data || err.message);
    //         return { status: err.response?.status || 500, data: null };
    //     }
    // }

    async getHighPriorityIssueByIndex(headers, projectKey, index = 0) {
        try {
            const excludedStatuses = [
                "Resolved",
                "Closed",
                "Done",
                "Отмененный",
                "Нет информации",
                "Не актуально",
                "Завершено",
                "Заблокировано"
            ];

            const jql = `
            project = ${projectKey}
            AND priority in (Критичный, Высокий)
            AND status NOT IN (${excludedStatuses.map(s => `"${s}"`).join(", ")})
            ORDER BY created DESC
            `.trim();

            const response = await baseAPI.get(
                `/rest/api/2/search?jql=${encodeURIComponent(jql)}&startAt=${index}&maxResults=1`,
                { headers }
            );

            return {
                status: 200,
                data: {
                    issue: response.data.issues[0] || null,
                    total: response.data.total,
                    index,
                    isFirst: index === 0,
                    isLast: index >= response.data.total - 1
                }
            };
        } catch (err) {
            console.error("Ошибка при получении задачи:", err.response?.data || err.message);
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

    // async getIssueWorkflowStatuses(headers, issueKey) {
    //     try {
    //         const issueResponse = await baseAPI.get(`/rest/api/2/issue/${issueKey}`, { headers });
    //         const projectKey = issueResponse.data.fields.project.key;
    //         const issueTypeId = issueResponse.data.fields.issuetype.id;
    //
    //         // статусы для всех типов задач проекта
    //         const statusesResponse = await baseAPI.get(`/rest/api/2/project/${projectKey}/statuses`, { headers });
    //
    //         //нужный issueType и возвращаем его статусы
    //         const typeStatuses = statusesResponse.data.find(type => type.id === issueTypeId);
    //
    //         if (!typeStatuses) {
    //             return { status: 404, data: null, message: "Тип задачи не найден в статусах проекта." };
    //         }
    //
    //         return {
    //             status: 200,
    //             data: typeStatuses.statuses
    //         };
    //
    //     } catch (err) {
    //         console.error("Ошибка при получении статусов workflow:", err.response?.data || err.message);
    //         return {
    //             status: err.response?.status || 500,
    //             data: null,
    //             message: "Не удалось получить статусы workflow задачи."
    //         };
    //     }
    // }

}

module.exports = new JiraService();