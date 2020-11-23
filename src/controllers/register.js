const { User } = require('../models')
const response = require('../helpers/responsStandard')
const joi = require('joi')

module.exports = {
  register: async (req, res) => {
    try {
      const schema = joi.object({
        phone: joi.string().required()
      })

      const { value, error } = schema.validate(req.body)
      const { phone } = value

      if (error) {
        return response(res, `Joi ${error}`, '', false)
      } else {
        const checkPhone = await User.findAll({ where: { phone } })
        if (checkPhone.length) {
          return response(res, 'Phone already registerd', '', false)
        } else {
          const results = await User.create({
            phone
          })
          if (results) {
            return response(res, 'Register successfully', { results }, true)
          } else {
            return response(res, 'Fail to registerd', '', false)
          }
        }
      }
    } catch (err) {
      return response(res, `${err}`, '', false)
    }
  }
}
