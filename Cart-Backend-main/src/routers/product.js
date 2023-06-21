const express = require('express')
const router = new express.Router()
const adminAuth = require('../middleware/adminAuth')
const Product = require('../models/product')
const User = require('../models/user')
const Cart = require('../models/cart')

// @desc Get all products
// @route GET /catelog
// @access Public
router.get('/catalogue', async (req, res) => {
  try {
    const product = await Product.find({})
    if (product === '') {
      res.send('No product available')
    }
    res.send(product)
  } catch (e) {
    res.status(400).send(e)
  }
})

// @desc Insert Single New Product
// @route POST /user/admin/createproduct
// @access Admin
router.post('/user/admin/createproduct', adminAuth, async (req, res) => {
  const product = new Product({
    ...req.body,
    owner: req.user._id,
  })
  try {
    await product.save()
    res.status(201).send(product)
  } catch (e) {
    res.status(400).send(e)
  }
})

// @desc Insert multiple New Product
// @route POST /user/admin/createproducts
// @access Admin
router.post('/user/admin/createproducts', adminAuth, async (req, res) => {
  const products = req.body
  try {
    const product = products.map(
      (pp) => new Product({ ...pp, owner: req.user._id })
    )

    console.log(product)
    await Product.insertMany(product)
    res.status(201).send(product)
  } catch (e) {
    res.status(400).send(e)
  }
})

// @desc Create Another Admin or User
// @route POST /user/admin/createadminoruser
// @access Admin
router.post('/user/admin/createadminoruser', adminAuth, async (req, res) => {
  const user = new User(req.body)

  if (user.isAdmin !== 'true') {
    try {
      const token = await user.generateAuthToken()
      await user.save()

      res.status(201).send({ user, token })
    } catch (e) {
      res.status(400).send(e)
    }
  } else {
    try {
      const token = await user.generateAuthTokenAdmin()
      await user.save()

      res.status(201).send({ user, token })
    } catch (e) {
      res.status(400).send(e)
    }
  }
})

// @desc DELETE product using its id
// @route DELETE /user/admin/product/:id
// @access Admin
router.delete('/user/admin/product/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id })
    console.log(product)
    if (!product) {
      return res.status(404).send()
    }
    res.status(200).send(product)
  } catch (e) {
    res.status(500).send()
  }
})

// @desc UPDATE product using its id
// @route UPDATE /user/admin/product/:id
// @access Admin
router.patch('/user/admin/product/:id', adminAuth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = [
    'name',
    'brand',
    'category',
    'description',
    'rating',
    'numReviews',
    'price',
    'countInStock',
  ]
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    const product = await Product.findOne({ _id: req.params.id })

    updates.forEach((update) => (product[update] = req.body[update]))
    await product.save()

    if (!product) {
      return res.status(404).send()
    }

    res.send(product)
  } catch (e) {
    res.status(400).send(e)
  }
})

// @desc DELETE user or admin
// @route DELETE /user/admin/user/:id
// @access Admin
router.delete('/user/admin/user/:id', adminAuth, async (req, res) => {
  try {
    Cart.findOne({ user: req.params.id }).then(async (cart) => {
      if (cart) {
        await Cart.deleteMany({ _id: cart._id })
      }
    })

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user || user._id === req.user._id) {
      return res.status(404).send()
    }

    res.send(user)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
