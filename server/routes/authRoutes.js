const router = require('express').Router();
const { login } = require('../controllers/AuthController');


router.post('/', login)

module.exports = router;