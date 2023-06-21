const express = require('express')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const { discountCode, priceRuleList } = require('./controllers/discount')
const {
  fulfillmentEventList,
  fullfillmentCancel,
  locationById,
  listofDiscountCodeByPriceRuleId,
  listOfWebhooks,
  fulfillmentEventById,
  deleteWebhook,
} = require('./controllers/extraapi')
const {
  getLocation,
  fulfillmentCreate,
  fulfillmentEventCreate,
} = require('./controllers/fullfilement')
const {
  createCompany,
  getAllProductsFirstPage,
  getAllProductsNextPage,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrderList,getParticularProduct
} = require('./controllers/order')
const { shopify, shopifyCallback } = require('./controllers/shopifyAuth')
const { webhookCreate, webhookAddress } = require('./controllers/webhooke')

const shopifyApiPublicKey = '27911a1bc0bd87b089bb1f1e4fdc60c2'
const shopifyApiSecretKey = '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'


dotenv.config()
const app = express()
const PORT = 80

app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('app running')
})

///////////// for Shopify authentication /////////////

app.get('/shopify', shopify)

app.get('/shopify/callback', shopifyCallback)

///////////// shopify api /////////////

// create company and its campaign
app.post('/createCompany', createCompany)

//get particular product by title
app.post('/admin/api/2021-07/products', getParticularProduct)

//get all products
app.post('/admin/api/2021-07/products.json', getAllProductsFirstPage)

//get next page products
app.post('/admin/api/2021-07/nextproducts', getAllProductsNextPage)

// create order
app.post('/admin/api/2021-07/orders.json', createOrder)

// update order
app.put('/admin/api/2021-07/orders.json', updateOrder)

//cancel order
app.post('/admin/api/2021-07/cancel.json', cancelOrder)

// get order list
app.get('/order/get', getOrderList)

// get registered location id
app.get('/admin/api/locationid', getLocation)

//fullfillment create
app.post('/admin/api/fullfillmentcreate', fulfillmentCreate)

// fullfillment event create
app.post(
  '/admin/api/2021-07/orders/fulfillments/events.json',
  fulfillmentEventCreate
)

//create webhook for fullfillment create
app.post('/admin/api/2021-07/webhooks.json', webhookCreate)

// webhook address
app.post('/webhook', webhookAddress)

//get price rule list
app.get('/admin/api/2021-10/price_rules.json', priceRuleList)

// create discount code
app.post(
  '/admin/api/2021-07/price_rules/507328175/discount_codes.json',
  discountCode
)

//-------------- rest all end point are made for testing purpose-----------//

//get location info by id
app.get('/admin/api/locationbyid', locationById)

// fullfillment cancel
app.post('/admin/api/fullfillmentcancel', fullfillmentCancel)

// fullfillment event get list
app.get(
  '/admin/api/2021-07/orders/fulfillments/events.json/list',
  fulfillmentEventList
)

// get fullfillment event get by id
app.get(
  '/admin/api/2021-07/orders/fulfillments/events.json/id',
  fulfillmentEventById
)

//get list of webhook
app.get('/admin/api/2021-07/webhooks.json', listOfWebhooks)

//delete webhook
app.delete('/admin/api/2021-07/webhooks.json', deleteWebhook)

//list of discount code by price rule id
app.get(
  '/admin/api/2021-07/price_rules/507328175/discount_codes.json',
  listofDiscountCodeByPriceRuleId
)

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
