const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const AppController = require('../controllers/AppController');

const cookieMiddleware = require("../middleware/auth");

router.get('/login', AuthController.login);
router.get('/sync', cookieMiddleware, AuthController.checkAuth);

router.get('/user', cookieMiddleware, AppController.getUser);

router.get('/project', cookieMiddleware, AppController.getProjects);
router.post('/project', cookieMiddleware, AppController.setProject);


module.exports = router;