const axios = require("axios");

const baseAPI = axios.create({
    baseURL: 'http://158.160.136.64:8080/',
    withCredentials: true,
});

module.exports = baseAPI;