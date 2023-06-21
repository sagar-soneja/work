const express = require('express')
const userRouter = require('./routers/user')
const productRouter = require('./routers/product')
const cartRouter = require('./routers/Cart')
const orderRouter = require('./routers/order')
require('./db/mongoose')

const app = express()

app.use(express.json())
app.use('/api', userRouter)
app.use('/api', productRouter)
app.use('/api', cartRouter)
app.use('/api', orderRouter)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log('Server is up running on Port :' + port)
})
