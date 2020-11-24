const route = require('express').Router()
const auth = require('../middleware/auth')

const {
  createMessage, getMessageFrom, getListMessage,
  deleteMessage, deleteAllMessageFrom
} = require('../controllers/chats')

route.post('/:id', auth, createMessage)
route.get('/personal/:id', auth, getMessageFrom)
route.get('/list', auth, getListMessage)
route.delete('/personal/:id/:on', auth, deleteMessage)
route.delete('/personal/:id', auth, deleteAllMessageFrom)

module.exports = route
