const asyncHandler = require('express-async-handler')
const Shopify = require('shopify-api-node')

const { db, admin } = require('../controllers/firebaseConfig')

// @desc get price rule list
// @REQUEST get
const priceRuleList = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.priceRule
    .list()
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc create discountCode
// @REQUEST post
const discountCode = asyncHandler(async (req, res) => {
  const { discount, priceRule, code, influencerid } = req.body
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.discountCode
    .create(
      priceRule,
      { code: code }
      // code will be string
    )
    .then(async (ress) => {
      const docRef = db.collection('deals')
      // getting reference to our db using influencerid
      return await docRef
        .where('influencerid', '==', influencerid)
        .limit(1)
        .get()
    })
    .then(async (query) => {
      // updating the dicount code in db
      const thing = query.docs[0]

      const temp = thing.data()

      temp.couponCode.push({ code: code, discount: discount })

      return await thing.ref.update(temp)
    })
    .then((ress) => {
      console.log('added to db')
      res.send('added to db')
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

module.exports = {
  priceRuleList,
  discountCode,
}
