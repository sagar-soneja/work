const jwt = require('jsonwebtoken')
const User = require('../models/user')

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRETADMIN)
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
      isAdmin: true,
    })

    if (!user) {
      throw new Error()
    }

    req.token = token
    req.user = user
    next()
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

module.exports = adminAuth
