const { Chat, User } = require('../models')
const { Op } = require('sequelize')
const response = require('../helpers/responsStandard')
const joi = require('joi')
const io = require('../App') // dapat dari export module di file APP

module.exports = {
  createMessage: async (req, res) => {
    try {
      const receiver = req.params.id
      const myAccount = req.user.jwtToken.id
      const { APP_KEY } = process.env

      const schema = joi.object({
        message: joi.string()
      })
      const { value, error } = schema.validate(req.body)
      const { message } = value
      if (error) {
        return response(res, `Schema: ${error}`, '', false)
      } else {
        if (Number(receiver) === myAccount) {
          return response(res, 'You can not sent message for your self, USE YOUR BRAIN', '', false)
        } else {
          const checkReceiver = await User.findAll({
            where: {
              id: receiver
            }
          })
          if (checkReceiver.length > 0) {
            if (req.file === undefined) {
              const checkIsNew = await Chat.update({ isNew: 0 }, {
                where: {
                  [Op.or]: [
                    {
                      [Op.and]: [
                        {
                          receiver: receiver
                        },
                        {
                          sender: myAccount
                        }
                      ]
                    },
                    {
                      [Op.and]: [
                        {
                          receiver: myAccount
                        },
                        {
                          sender: receiver
                        }
                      ]
                    }
                  ]
                }
              })
              if (checkIsNew) {
                const data = {
                  sender: myAccount, receiver, message, isNew: 1
                }
                //   console.log(message)
                const results = await Chat.create(data)
                if (results) {
                  console.log('recccccc', receiver)
                  io.emit(receiver, { sender: myAccount, message })

                  return response(res, 'Message sent successfully', { results }, true)
                } else {
                  return response(res, 'Fail to sent message', '', false)
                }
              }
            } else {
              const image = `http://localhost:${APP_KEY}/uploads/message/${req.file.filename}`
              const data = {
                sender: myAccount, receiver, message, image
              }
              const results = await Chat.create(data)
              if (results) {
                return response(res, 'Message sent successfully', { results }, true)
              } else {
                return response(res, 'Fail to sent message', '', false)
              }
            }
          } else {
            return response(res, 'User not found', '', false)
          }
        }
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  getMessageFrom: async (req, res) => {
    const myAccount = req.user.jwtToken.id
    const myFriend = req.params.id
    try {
      const checkList = await Chat.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  sender: myAccount
                },
                {
                  receiver: myFriend
                }
              ]
            },
            {
              [Op.and]: [
                {
                  sender: myFriend
                },
                {
                  receiver: myAccount
                }
              ]
            }
          ]
        },
        include: [{ model: User, as: 'pengirim' }, { model: User, as: 'penerima' }]
      })
      if (checkList.length > 0) {
        const results = checkList
        return response(res, `Your chat with ${myFriend}`, { results }, true)
      } else {
        return response(res, 'Dont have chat', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  getListMessage: async (req, res) => {
    try {
      const myAccount = req.user.jwtToken.id

      const results = await Chat.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  sender: myAccount
                },
                {
                  isNew: 1
                }
              ]
            },
            {
              [Op.and]: [
                {
                  receiver: myAccount
                },
                {
                  isNew: 1
                }
              ]
            }
          ]
        },
        include: [{ model: User, as: 'pengirim' }, { model: User, as: 'penerima' }],
        order: [['createdAt', 'DESC']]
      })
      if (results.length > 0) {
        return response(res, 'List', { results }, true)
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
