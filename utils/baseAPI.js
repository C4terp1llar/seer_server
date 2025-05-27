const axios = require("axios");

const baseAPI = axios.create({
    baseURL: 'http://193.164.17.141:6934/',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Atlassian-Token": "no-check"
    }
});

module.exports = baseAPI;