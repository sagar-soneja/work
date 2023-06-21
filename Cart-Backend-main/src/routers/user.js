const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Cart = require('../models/cart')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

// USER ACCESS

// @desc Create new user
// @route POST /user/signup
// @access Public
router.post('/user/signup', async (req, res) => {
  const user = new User(req.body)

  if (user.isAdmin === 'true') {
    return res.status(400).send('You cant create admin user')
  }

  try {
    const token = await user.generateAuthToken()

    await user.save()

    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

// @desc Login user
// @route POST /user/login
// @access Public
router.post('/user/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    if (user.isAdmin === 'true') {
      throw new Error('Cant login with this credentials')
    }
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

// @desc Logout from current session
// @route POST /user/logout
// @access User
router.post('/user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.user.save()
    res.status(200).send('Logout successfully')
  } catch (e) {
    res.status(500).send()
  }
})

// @desc Logout from all session
// @route POST /user/logoutAll
// @access User
router.post('/user/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send('Logout successfully from all devices')
  } catch (e) {
    res.status(500).send()
  }
})

// @desc Get user info
// @route GET /user/me
// @access User
router.get('/user/me', auth, async (req, res) => {
  res.send(req.user)
})

// @desc Update user info
// @route Update /user/me
// @access User
router.patch('/user/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates' })
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()

    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

// @desc Delete user
// @route Delete /user/me
// @access User
router.delete('/user/me', auth, async (req, res) => {
  try {
    Cart.findOne({ user: req.user }).then(async (cart) => {
      await Cart.deleteMany({ _id: cart._id })
      console.log(cart)
    })
    const user = await User.findByIdAndDelete(req.user._id)

    if (!user) {
      return res.status(404).send()
    }
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

// ADMIN  ACCESS

// @desc Login Admin
// @route POST /user/admin
// @access Public
router.post('/user/admin', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    // console.log(user)
    if (user.isAdmin !== 'true') {
      res.status(401).send('Cant login as admin')
    }
    const token = await user.generateAuthTokenAdmin()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send('Error')
  }
})

// @desc Get Admin INFO
// @route GET /user/admin/me
// @access Admin
router.get('/user/admin/me', adminAuth, async (req, res) => {
  res.send(req.user)
})

module.exports = router
