const route = require('express').Router()
const { myProfile, updateProfile, createUser, deleteUser } = require('../controllers/users')

const auth = require('../middleware/auth')
const uploads = require('../helpers/uploadProfile')

route.get('/profile', auth, myProfile)
route.patch('/profile/update', auth, uploads, updateProfile)
route.post('/', createUser)
route.delete('/:id', deleteUser)

module.exports = route
