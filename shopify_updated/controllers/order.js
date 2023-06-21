const asyncHandler = require('express-async-handler')
const Shopify = require('shopify-api-node')
const uuid = require('uuid')
const { db, admin } = require('../controllers/firebaseConfig')

// @desc create company and its campaign in db using shopname, accesstoken, campaign_id, company_id
// @REQUEST POST
const createCompany = asyncHandler(async (req, res) => {
  const {
    company_id,
    shopName,
    isOrderEligible,
    companyName,
    campaign_id,
    accessToken,
  } = req.body
  var isShopifyConnected = false
  if (accessToken && shopName) {
    isShopifyConnected = true
  }
  const docRef = db.collection('companies').doc(`${company_id}`)
  const obj = await docRef.get()
  console.log(obj.data())
  if (obj.data() === undefined) {
    await docRef
      .set(
        {
          campaignRef: [db.collection('campaign').doc(`${campaign_id}`)],
          shopName: shopName,
          companyName: companyName,
          // access token to be added
        },
        { merge: true }
      )
      .then(async (result) => {
        const Campaign = db.collection('campaign').doc(`${campaign_id}`)
        const ress = await Campaign.set(
          {
            dealRef: [],
            isOrderEligible: isOrderEligible,
            isShopifyConnected: isShopifyConnected,
          },
          { merge: true }
        )
        return ress
      })
      .then((ress) => res.send('added to db'))
      .catch((err) => res.status(400).send(err))
  } else {
    const Campaign = db.collection('campaign').doc(`${campaign_id}`)
    let arrUnion = docRef.update({
      campaignRef: admin.firestore.FieldValue.arrayUnion(Campaign),
    })
    if (arrUnion) {
      await Campaign.set(
        {
          dealRef: [],
          isOrderEligible: isOrderEligible,
          isShopifyConnected: isShopifyConnected,
        },
        { merge: true }
      )
        .then((ress) => {
          res.send('created')
        })
        .catch((err) => res.send(err))
    }
  }
})

// @desc get particular product by title
// @REQUEST post
const getParticularProduct = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.product
    .list({ limit: 250, title: `${req.body.title}` })
    .then((order) => {
      console.log(order)
      res.send(order)
    })
    .catch((err) => console.log(err))
})

// @desc get list of all available products upto 250
// @REQUEST get
const getAllProductsFirstPage = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.product
    .list({ limit: 250 })
    .then((order) => {
      console.log(order)
      res.send(order)
    })
    .catch((err) => console.log(err))
})

// @desc get list of all available products for next page using last product id
// @REQUEST get
const getAllProductsNextPage = asyncHandler(async (req, res) => {
  const { id } = req.body
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.product
    .list({
      since_id: id,
    })
    .then((order) => {
      console.log(order)
      res.send(order)
    })
    .catch((err) => console.log(err))
})

// @desc create order
// @REQUEST post
const createOrder = asyncHandler(async (req, res) => {
  const {
    
    influencerid,
    line_items,
    note,
    email,
    shipping_address,
    influencer_name,
    Address,
    dealid,
  } = req.body
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  //order object (we get this from frontend)
  // line items contain variant id and quantity
  let newOrder = {
    line_items: line_items,
    email: email,
    shipping_address: shipping_address,
    note: note,
  }

  client.order
    .create(newOrder)
    .then(async (ress) => {
      console.log(ress)
      // const dealid = uuid.v4()
      // creating line item obj which includes only variant_id, name, price and quantity
      const line_items_array = []
      const t = ress.line_items
      for (var key in t) {
        const obj = new Object()
        // console.log(key)
        const u = t[key]
        for (var key1 in u) {
          // console.log(key1)
          // console.log(key.key1)
          if (key1 === 'variant_id') obj.id = u[key1]

          if (key1 === 'name') obj.name = u[key1]

          if (key1 === 'price') obj.price = u[key1]

          if (key1 === 'quantity') obj.quantity = u[key1]
        }
        console.log(obj)
        line_items_array.push(obj)
      }
      // including data to deals, dealid is random id
      const docRef = db.collection('deals').doc(`${dealid}`)
      const obj = await docRef.set(
        {
          influencerid: influencerid,
          name: influencer_name,
          isOrder: true,
          isCancelled: false,
          couponCode: [],
          Address: Address,
          order_id: ress.id,
          status: 'order_created',
          order: {
            line_items: line_items_array,
            email: email,
            shipping_address: shipping_address,
            note: note,
          },
        },
        { merge: true }
      )
      return obj
    })
    .then((ress) => {
      console.log('added successfully')
      res.send('added successfully')
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})


// @desc update the order (We cant update item and its quantity)
// @REQUEST put
const updateOrder = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })
  const data = req.body
  const order_id = data.order_id
  delete data.order_id

  const dealid = data.dealid
  delete data.dealid

  // data will be the object which we want to update, but we cant update lineItem array

  client.order
    .update(order_id, data)
    .then(async (ress) => {
      const docRef = db.collection('deals').doc(`${dealid}`)
      const obj = await docRef.set(
        {
          order: data,
        },
        { merge: true }
      )
      return obj
    }) // order's id
    .then((ress) => {
      console.log(ress)
      res.send('updated in db')
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc cancel order by using order id
// @REQUEST post
const cancelOrder = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  const { order_id, deal_id } = req.body
  client.order
    .cancel(order_id)
    .then(async (ress) => {
      // updating in db (not deleting it)
      const docRef = db.collection('deals').doc(`${deal_id}`)
      const obj = await docRef.set(
        {
          isCancelled: true,
        },
        { merge: true }
      )
      return obj
    })
    .then((ress) => {
      console.log('order cancelled')
      res.send(ress)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

// @desc get order list
// @REQUEST get
const getOrderList = asyncHandler(async (req, res) => {
  const client = new Shopify({
    shopName: 'finalsoneja.myshopify.com',
    accessToken: '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',
  })

  client.order
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

module.exports = {
  getOrderList,
  cancelOrder,
  updateOrder,
  createOrder,
  getAllProductsFirstPage,
  getAllProductsNextPage,
  createCompany,getParticularProduct
}
