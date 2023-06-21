const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Cart = require('../models/cart')

// @desc add item to cart using id
// @route POST /user/addtocart/:id
// @access User
router.post('/user/addtocart/:id', auth, async (req, res) => {
  const user = req.user

  const item = {
    product: req.params.id,
    quantity: req.body.quantity,
  }

  Cart.findOne({ user })
    .then((foundCart) => {
      if (foundCart) {
        let products = foundCart.items.map((item) => item.product)
        if (products.includes(item.product)) {
          Cart.findOneAndUpdate(
            {
              user: user,
              items: {
                $elemMatch: { product: item.product },
              },
            },
            {
              $set: { 'items.$.quantity': item.quantity },
            }
          )
            .exec()
            .then(() => res.send('Product Updated in Cart'))
        } else {
          foundCart.items.push(item)
          foundCart.save().then(() => res.send('Product is Added in Cart'))
        }
      } else {
        Cart.create({
          user: user,
          items: [item],
        }).then(() => res.status(201).send('Product is Added in Cart'))
      }
    })
    .catch((e) => res.status(400).send(e))
})

// @desc Get info of all the item present in cart
// @route GET /user/cart
// @access User
router.get('/user/cart', auth, async (req, res) => {
  const cartitems = Cart.findOne({ user: req.user.id })
  cartitems.populate('items.product').exec((err, cart) => {
    if (!cart || cart.items.length === 0) {
      return res.send('Cart is empty')
    }

    res.status(200).send(cart)
  })
})

// @desc REMOVE item from Cart
// @route PUT /user/removefromcart/:id
// @access User
router.put('/user/removefromcart/:id', auth, async (req, res) => {
  const cart = Cart.findOne({ user: req.user.id })
  // console.log(cart)

  if (!cart) {
    return res.send('Cart doesnt exist')
  }

  cart.then((foundcartitem) => {
    foundcartitem.items = foundcartitem.items.filter(
      (item) => item._id != req.params.id
    )
    foundcartitem.save(() => res.status(200).send('Item is Deleted from Cart'))
  })
})

module.exports = router
