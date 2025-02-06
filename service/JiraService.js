const baseAPI = require("../utils/baseAPI");

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

    async getIssuesTypes(headers, project) {

        try {
            const response = await baseAPI.get(`/rest/api/2/issue/createmeta/${project}/issuetypes`, {
                headers: headers,
            });


            if (response.status === 200 && response.data) {
                const issueTypes = response.data.values.map(issueType => issueType.name);
                return { status: 200, data: issueTypes };
            }

            return { status: 404, data: null};
        } catch (err) {
            console.log(err.response?.data);
            return { status: err.response?.status || 500, data: null };
        }
    }



}

module.exports = new JiraService();