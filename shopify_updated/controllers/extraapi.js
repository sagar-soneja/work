const asyncHandler = require('express-async-handler')
const Shopify = require('shopify-api-node')

const { db } = require('../controllers/firebaseConfig')

// @desc get location of store by id
// @REQUEST get
const locationById = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.location
    .get(61044687088) // location's id
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc cancel fullfillment
// @REQUEST post
const fullfillmentCancel = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  // cancel(orderId, fullfilementid)
  client.fulfillment
    .cancel(3864911872240, 3441257808112)
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc get fullfillment event list
// @REQUEST get
const fulfillmentEventList = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  //list(orderId, fulfillmentId[, params])
  client.fulfillmentEvent
    .list(4320373047525, 3839972606181)
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc get fullfillment event by id
// @REQUEST get
const fulfillmentEventById = asyncHandler(async (req, res) => {
  const { order_id, fulfillment_id } = req.body
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  client.fulfillmentEvent
    .get(order_id, fulfillment_id, id)
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc list of webhooks
// @REQUEST get
const listOfWebhooks = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.webhook
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

// @desc delete webhook
// @REQUEST delete
const deleteWebhook = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  //delete(id)
  client.webhook
    .delete(1049540853966)
    .then((ress) => {
      console.log(ress)
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc get list of all the discount code created using particular price rule
// @REQUEST get
const listofDiscountCodeByPriceRuleId = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.discountCode
    .list(req.body.priceRule)
    .then((ress) => res.send(ress))
    .catch((err) => res.send(err))
})

module.exports = {
  fulfillmentEventList,
  fullfillmentCancel,
  locationById,
  listofDiscountCodeByPriceRuleId,
  listOfWebhooks,
  fulfillmentEventById,
  deleteWebhook,
}
