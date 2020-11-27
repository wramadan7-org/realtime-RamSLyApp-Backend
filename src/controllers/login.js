const { User } = require('../models')
const response = require('../helpers/responsStandard')
const jwt = require('jsonwebtoken')
const joi = require('joi')
// const { token } = require('morgan')

module.exports = {
  login: async (req, res) => {
    const schema = joi.object({
      phone: joi.string().required()
    })
    const { value, error } = schema.validate(req.body)
    const { phone } = value
    try {
      if (error) {
        return response(res, `${error}`, '', false)
      } else {
        const checkPhone = await User.findAll({
          where: {
            phone
          }
        })
        if (checkPhone.length > 0) {
          const { APP_PORT } = process.env
          const jwtToken = {
            id: checkPhone[0].id,
            name: checkPhone[0].name,
            phone: checkPhone[0].phone,
            info: checkPhone[0].info,
            profile: checkPhone[0].profile
          }
          const token = jwt.sign({ jwtToken }, APP_PORT)
          return response(res, 'Login successfully', { token }, true)
        } else {
          return response(res, 'Phone not found', '', false)
        }
      }
    } catch (err) {
      return response(res, `Catch: ${err}`, '', false)
    }
  }
}
