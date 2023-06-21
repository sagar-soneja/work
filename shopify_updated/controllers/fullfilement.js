const asyncHandler = require('express-async-handler')
const Shopify = require('shopify-api-node')

// @desc get list  location of stores
// @REQUEST get
const getLocation = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.location
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

// @desc create fullfillment ( this endpoint is for testing purpose, )
// @REQUEST post
const fulfillmentCreate = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  // create(orderId, params)
  client.fulfillment
    .create(4321276788957, {
      status: 'open',
      location_id: 65630798045,
      tracking_number: null,
      notify_customer: true,
      line_items: [
        {
          id: 11024875225309, // variant id
        },
      ],
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

// @desc create fullfillment event( at this point our webhook going to trigger)
// @REQUEST post
const fulfillmentEventCreate = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  // create(orderId, fulfillmentId, params)
  client.fulfillmentEvent
    .create(4321276788957, 3840186581213, {
      status: 'delivered',
      address1: 'sdalghals;gkhdasdhg',
      city: 'mathura',
      country: 'India',
      message: 'aa raha hae wait karo',
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

module.exports = {
  getLocation,
  fulfillmentCreate,
  fulfillmentEventCreate,
}
