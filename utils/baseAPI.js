const axios = require("axios");

const baseAPI = axios.create({
    baseURL: 'http://84.201.149.172:8080/',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Atlassian-Token": "no-check"
    }
});

module.exports = baseAPI;