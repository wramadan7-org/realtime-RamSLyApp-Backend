const route = require('express').Router()

// import controller
const { register } = require('../controllers/register')

route.post('/', register)

module.exports = route
