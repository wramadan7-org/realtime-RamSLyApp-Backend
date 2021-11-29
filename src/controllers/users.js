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
  getAllUser: async (req, res) => {
    const { search } = req.query
    if (search) {
      const searchUser = await User.findAll({
        where: {
          name: { [Op.like]: `%${search}%` }
        }
      })
      if (searchUser.length > 0) {
        const results = searchUser
        return response(res, `Your search user ${search}`, { results }, true)
      } else {
        const results = searchUser
        return response(res, 'Not found', { results }, false)
      }
    }
    const results = await User.findAll({
      order: [['name', 'ASC']]
    })
    return response(res, 'All user', { results }, true)
  },
  getProfileByParams: async (req, res) => {
    try {
      const { id } = req.params
      const getParams = await User.findAll({ where: { id } })
      if (getParams.length > 0) {
        const results = getParams[0]
        return response(res, 'Your friend', { results }, true)
      } else {
        return response(res, 'Id not found', '', false)
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { id } = req.user.jwtToken
      console.log(req.file)
      // const { APP_PORT } = process.env
      const checkUser = await User.findAll({
        where: {
          id
        }
      })
      if (checkUser.length > 0) {
        const schema = joi.object({
          name: joi.string(),
          phone: joi.string(),
          info: joi.string(),
          profile: joi.string()
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
              const data = {
                name, info, phone
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
          const profile = `uploads/profile/${req.file.filename}`
          if (error) {
            return response(res, `Schema form: ${error}`, '', false)
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
  changePhoneNumber: async (req, res) => {
    try {
      const schema = joi.object({
        oldPhone: joi.string().required(),
        newPhone: joi.string().required()
      })
      const { value, error } = schema.validate(req.body)
      const { oldPhone, newPhone } = value
      if (error) {
        return response(res, `Schema: ${error}`, '', false)
      } else {
        const checkOldPhone = req.user.jwtToken.phone
        const { id } = req.user.jwtToken
        const checkPhoneDB = await User.findAll({
          where: {
            [Op.and]: [
              { id },
              { phone: oldPhone }
            ]
          }
        })
        if (checkPhoneDB.length > 0) {
          const checkAnotherPhone = await User.findAll({
            where: {
              phone: {
                [Op.ne]: checkOldPhone
              }
            }
          })
          const mapPhone = checkAnotherPhone.map(o => {
            return o.phone
          })
          const checkSamePhone = await mapPhone.some(item => item === newPhone)
          if (checkSamePhone === true) {
            return response(res, 'Phone is already registerd', '', false)
          } else {
            if (oldPhone === newPhone) {
              return response(res, 'Please insert new phone number', '', false)
            }
            const data = {
              phone: newPhone
            }
            const updatePhone = await User.update(data, {
              where: { id }
            })
            if (updatePhone.length > 0) {
              const getUpdatePhone = await User.findAll({
                attributes: ['phone'],
                where: { id }
              })
              const results = getUpdatePhone[0]
              return response(res, 'Success change phone number', { results }, true)
            } else {
              return response(res, 'Fail to change phone number', '', false)
            }
          }
        } else {
          return response(res, 'Old phone invalid', '', false)
        }
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
