module.exports = (response, message, additionalData, success = true) => {
  return response.send({
    success,
    message: message || 'success',
    ...additionalData
  })
}
