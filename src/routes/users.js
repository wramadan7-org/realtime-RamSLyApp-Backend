const route = require('express').Router()
const {
  myProfile,
  updateProfile,
  createUser,
  deleteUser,
  getAllUser,
  getProfileByParams,
  changePhoneNumber
} = require('../controllers/users')

const auth = require('../middleware/auth')
const uploads = require('../helpers/uploadProfile')

route.get('/profile', auth, myProfile)
route.get('/:id', auth, getProfileByParams)
route.patch('/profile/update', auth, uploads, updateProfile)
route.patch('/changePhone', auth, changePhoneNumber)
route.post('/', createUser)
route.get('/', getAllUser)
route.delete('/:id', deleteUser)

module.exports = route
