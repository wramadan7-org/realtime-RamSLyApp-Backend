require('dotenv').config()
const response = require('../helpers/responsStandard')
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const { authorization } = req.headers
  const { APP_PORT } = process.env
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7, authorization.length)
    try {
      jwt.verify(token, APP_PORT, (error, decode) => {
        if (error) {
          return response(res, `JWT ERROR: ${error}`, '', false)
        } else {
          req.user = decode
          next()
        }
      })
    } catch (err) {
      return response(res, `${err}`, '', false)
    }
  } else {
    return response(res, 'Forbidden access', '', false)
  }
}
