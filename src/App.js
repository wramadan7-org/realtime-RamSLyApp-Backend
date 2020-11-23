const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const { APP_PORT } = process.env
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(morgan('dev'))

// import routes
const registerRoute = require('./routes/register')
const loginRoute = require('./routes/login')
const userRoute = require('./routes/users')
const chatRoute = require('./routes/chats')

// route login register
app.use('/register', registerRoute)
app.use('/login', loginRoute)

// content
app.use('/user', userRoute)
app.use('/chats', chatRoute)

app.use('/uploads/profile', express.static('src/assets/images/profile'))
app.use('/uploads/message', express.static('src/assets/images/message'))

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Backend is running'
  })
})

app.listen(APP_PORT, () => {
  console.log(`App listen on port ${APP_PORT}`)
})
