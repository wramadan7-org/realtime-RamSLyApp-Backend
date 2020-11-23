const { User } = require('../models')
const response = require('../helpers/responsStandard')
const joi = require('joi')
const { Op } = require('sequelize')

module.exports = {
  createUser: async (req, res) => {
    try {
      const schema = joi.object({
        name: joi.string(),
        info: joi.string(),
        phone: joi.string().required()
      })
      const { value, error } = schema.validate(req.body)
      const { name, phone, info } = value

      if (error) {
        return response(res, `Schema: ${error}`, '', false)
      } else {
        const checkPhone = await User.findAll({
          where: {
            phone
          }
        })
        if (checkPhone.length > 0) {
          return response(res, 'Phone number already exixst', '', false)
        } else {
          const profile = ''
          const results = await User.create({
            name, phone, info, profile
          })
          if (results) {
            return response(res, 'User has been created', { results }, true)
          } else {
            return response(res, 'Fail to create user', '', false)
          }
        }
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  myProfile: async (req, res) => {
    try {
      const { id } = req.user.jwtToken
      const getUser = await User.findAll({
        where: {
          id
        }
      })
      if (getUser.length) {
        const results = getUser[0]
        return response(res, 'My profile', { results }, true)
      } else {
        return response(res, 'Not found', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { id } = req.user.jwtToken
      const { APP_PORT } = process.env
      const checkUser = await User.findAll({
        where: {
          id
        }
      })
      if (checkUser.length > 0) {
        const schema = joi.object({
          name: joi.string().required(),
          phone: joi.string().required(),
          info: joi.string()
        })
        const { value, error } = schema.validate(req.body)
        const { name, info, phone } = value
        if (req.file === undefined) {
          if (error) {
            return response(res, `Schema: ${error}`, '', false)
          } else {
            const getPhoneFromDB = checkUser[0].phone
            const checkAnotherPhone = await User.findAll({
              where: {
                phone: {
                  [Op.ne]: getPhoneFromDB
                }
              }
            })
            const mapPhone = checkAnotherPhone.map(o => {
              return o.phone
            })
            const checkSamePhone = await mapPhone.some(item => item === phone)
            if (checkSamePhone === true) {
              return response(res, 'Phone is already registerd', '', false)
            } else {
              const profile = ''
              const data = {
                name, info, phone, profile
              }
              const updateMyProfile = await User.update(data, {
                where: {
                  id
                }
              })
              if (updateMyProfile.length > 0) {
                const getAfterUpdate = await User.findAll({
                  where: {
                    id
                  }
                })
                const results = getAfterUpdate[0]
                return response(res, 'Profile has been edited', { results }, true)
              } else {
                return response(res, 'Update fail', '', false)
              }
            }
          }
        } else {
          const profile = `http://localhost:${APP_PORT}/uploads/profile/${req.file.filename}`
          if (error) {
            return response(res, `Schema: ${error}`, '', false)
          } else {
            const getPhoneFromDB = checkUser[0].phone
            const checkAnotherPhone = await User.findAll({
              where: {
                phone: {
                  [Op.ne]: getPhoneFromDB
                }
              }
            })
            const mapPhone = checkAnotherPhone.map(o => {
              return o.phone
            })
            const checkSamePhone = await mapPhone.some(item => item === phone)
            if (checkSamePhone === true) {
              return response(res, 'Phone is already registerd', '', false)
            } else {
              const data = {
                name, info, phone, profile
              }
              const updateMyProfile = await User.update(data, {
                where: {
                  id
                }
              })
              if (updateMyProfile.length > 0) {
                const getAfterUpdate = await User.findAll({
                  where: {
                    id
                  }
                })
                const results = getAfterUpdate[0]
                return response(res, 'Profile has been edited', { results }, true)
              } else {
                return response(res, 'Update fail', '', false)
              }
            }
          }
        }
      } else {
        return response(res, 'User not found', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params
      const checkUser = await User.findAll({
        where: {
          id
        }
      })
      if (checkUser.length > 0) {
        const deleted = await User.destroy({
          where: {
            id
          }
        })
        if (deleted) {
          return response(res, 'Delete successfully', '', true)
        } else {
          return response(res, 'Fail to delete user', '', false)
        }
      } else {
        return response(res, 'User not found', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  }
}
