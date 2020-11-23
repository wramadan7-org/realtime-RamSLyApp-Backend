const { Chat } = require('../models')
const { User } = require('../models')
const { Op } = require('sequelize')
const response = require('../helpers/responsStandard')
const joi = require('joi')

module.exports = {
  createMessage: async (req, res) => {
    try {
      const receiver = req.params.id
      const sender = req.user.jwtToken.id
      const { APP_KEY } = process.env

      const schema = joi.object({
        message: joi.string()
      })
      const { value, error } = schema.validate(req.body)
      const { message } = value
      if (error) {
        return response(res, `Schema: ${error}`, '', false)
      } else {
        const checkReceiver = await User.findAll({
          where: {
            id: receiver
          }
        })
        if (checkReceiver.length > 0) {
          if (message === null) {
            return response(res, 'Message can not to be null', '', false)
          } else {
            if (req.file === undefined) {
              const data = {
                sender, receiver, message
              }
              console.log(message)
              const results = await Chat.create(data)
              if (results) {
                return response(res, 'Message sent successfully', { results }, true)
              } else {
                return response(res, 'Fail to sent message', '', false)
              }
            } else {
              const image = `http://localhost:${APP_KEY}/uploads/message/${req.file.filename}`
              const data = {
                sender, receiver, message, image
              }
              const results = await Chat.create(data)
              if (results) {
                return response(res, 'Message sent successfully', { results }, true)
              } else {
                return response(res, 'Fail to sent message', '', false)
              }
            }
          }
        } else {
          return response(res, 'User not found', '', false)
        }
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  getMessageFrom: async (req, res) => {
    try {
      const receiver = req.params.id
      const sender = req.user.jwtToken.id
      const getAllChat = await Chat.findAll({
        where: {
          sender
        }
      })
      if (getAllChat.length > 0) {
        const getChat = await Chat.findAll({
          where: {
            receiver
          }
        })
        if (getChat.length > 0) {
          const results = getChat
          return response(res, 'Your chat', { results }, true)
        } else {
          return response(res, `You dont have chat with ${receiver}`, '', false)
        }
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  getListMessage: async (req, res) => {
    try {
      const sender = req.user.jwtToken.id

      const checkList = await Chat.findAll({
        where: {
          sender
        }
      })
      if (checkList.length > 0) {
        const list = await Chat.findAll({
          attributes: ['receiver']
        })
        return response(res, 'List', { list }, true)
      } else {
        return response(res, 'You dont have chat anyting', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  deleteMessage: async (req, res) => {
    try {
      const receiver = req.params.id
      const messageOn = req.params.on
      const sender = req.user.jwtToken.id
      const getAllChat = await Chat.findAll({
        where: {
          sender
        }
      })
      if (getAllChat.length > 0) {
        const getChat = await Chat.findAll({
          where: {
            [Op.and]: [
              { receiver },
              { id: messageOn }
            ]
          }
        })
        if (getChat) {
          //   const results = getChat[0]
          //  return response(res, 'Your chat', { results }, true)
          const results = await Chat.destroy({
            where: {
              id: messageOn
            }
          })
          if (results) {
            return response(res, 'Message has been deleted', '', true)
          } else {
            return response(res, 'Fail to deleted', '', false)
          }
        } else {
          return response(res, 'Message not found', '', false)
        }
      } else {
        return response(res, 'Message not found', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  deleteAllMessageFrom: async (req, res) => {
    try {
      const receiver = req.params.id
      const sender = req.user.jwtToken.id

      const checkList = await Chat.findAll({
        where: {
          sender
        }
      })

      if (checkList.length > 0) {
        const deleted = await Chat.destroy({
          where: {
            receiver
          }
        })
        if (deleted) {
          return response(res, 'Delete successfully', '', true)
        } else {
          return response(res, 'Fail to deleted', '', false)
        }
      } else {
        return response(res, 'You dont have chat anyting', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  }
}
