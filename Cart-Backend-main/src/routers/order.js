const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Cart = require('../models/cart')

// @desc final list of items and total amount
// @route POST /user/buy
// @access User
router.post('/user/buy', auth, async (req, res) => {
  const cartitems = Cart.findOne({ user: req.user.id })

  cartitems.populate('items.product').exec((err, cart) => {
    if (!cart || cart.items.length === 0) {
      return res.send('Cart is empty')
    }

    var total = 0
    const order = cart.items.map((item) => {
      let order = {
        name: item.product.name,
        brand: item.product.brand,
        category: item.product.category,
        rating: item.product.rating,
        price: item.product.price,
        quantity: item.quantity,
      }
      total += order.price * order.quantity
      return order
    })

    res.status(200).send({ order, total })
  })
})

module.exports = router
