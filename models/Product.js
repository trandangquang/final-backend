const mongoose = require('mongoose')
const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cannot be left blank'],
  },
  description: {
    type: String,
    required: [true, 'Cannot be left blank'],
  },
  price: {
    type: String,
    required: [true, 'Cannot be left blank'],
  },
  category: {
    type: String,
    required: [true, 'Cannot be left blank'] ,
  },
  pictures: {
    type: Array,
    required: true
  }
},{minimize: false});

const Product = mongoose.model('Product', ProductSchema)
module.exports = Product