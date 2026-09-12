const express = require('express');
const { ranking } = require('../controllers/userController');

const router = express.Router();

router.get('/ranking', ranking);

module.exports = router;
