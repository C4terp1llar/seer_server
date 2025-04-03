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

router.get('/issue', cookieMiddleware, AppController.getIssuesStats);

router.post('/query/check', cookieMiddleware, AppController.checkJqlQuery);
router.post('/query', cookieMiddleware, AppController.createJqlQuery);
router.delete('/query/:queryId', cookieMiddleware, AppController.deleteJqlQuery);
router.get('/query', cookieMiddleware, AppController.getJqlQueries);
router.get('/query/:queryId', cookieMiddleware, AppController.getJqlQuery);

router.get('/note', cookieMiddleware, AppController.getNote);
router.post('/note', cookieMiddleware, AppController.createNote);

router.get('/event/months', cookieMiddleware, AppController.getEventsByMonth);
router.get('/event', cookieMiddleware, AppController.getEventsByDay);
router.post('/event', cookieMiddleware, AppController.createEvent);

module.exports = router;