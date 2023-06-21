const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
    },
  ],
})

cartSchema.methods.toJSON = function () {
  const cart = this
  const cartObject = cart.toObject()

  delete cartObject.user
  // delete cartObject.items.product.owner
  // delete cartObject.items.product.countInStock

  return cartObject
}

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
