const asyncHandler = require('express-async-handler')
const Shopify = require('shopify-api-node')

const { db } = require('../controllers/firebaseConfig')

// @desc create webhook (this webhook is for fullfillment create event )
// @REQUEST post
const webhookCreate = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  client.webhook
    .create({
      // where webhook going to trigger
      topic: `fulfillment_events/create`,
      // redirect address
      address: `https://da8c-103-216-239-171.ngrok.io/webhook`,
      format: 'json',
    })
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc webhook address (it get response from our webhook trigger)
const webhookAddress = asyncHandler(async (req, res) => {
  // const docRef = db.collection('status').doc(`${req.body.order_id}`)
  // await docRef
  //   .set(
  //     {
  //       fulfillment_id: req.body.fulfillment_id,
  //       status: req.body.status,
  //       estimated_delivery_at: req.body.estimated_delivery_at,
  //       city: req.body.city,
  //       country: req.body.country,
  //       message: req.body.message,
  //     },
  //     { merge: true }
  //   )
  const docRef = db.collection('deals')
  await docRef
    .where('order_id', '==', req.body.order_id)
    .limit(1)
    .get()
    .then(async (query) => {
      // console.log(query)
      const thing = query.docs[0]
      // console.log(thing.data())
      const temp = thing.data()

      temp.status = req.body.status
      console.log(temp)
      return await thing.ref.update(temp)
    })
    .then((ress) => {
      console.log('status updated')
      res.send('status updated')
    })
    .catch((err) => {
      console.log(err)
      res.send('err')
    })
})

module.exports = {
  webhookCreate,
  webhookAddress,
}
