const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const bodyParser = require('body-parser')
require('./connection')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server, {
  cors: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});

const User = require('./models/User')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const imageRoutes = require('./routes/imageRoutes')
const orderRoutes = require('./routes/orderRoutes',)

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use(express.json())
app.use('/users',userRoutes)
app.use('/products', productRoutes)
app.use('/images', imageRoutes)
app.use('/orders', orderRoutes);



server.listen(8080, ()=> {
  console.log('Server is running at port', 8080 )
})