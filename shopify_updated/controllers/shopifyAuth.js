const asyncHandler = require('express-async-handler')
const Shopify = require('shopify-api-node')
const ShopifyToken = require('shopify-token')

const crypto = require('crypto')

const querystring = require('querystring')
const axios = require('axios')
const cookieParser = require('cookie-parser')

const scopes = [
  'read_draft_orders',
  'read_products',
  'write_products',
  'write_draft_orders',
  'read_orders',
  'write_orders',
  'read_fulfillments',
  'write_fulfillments',
  'read_merchant_managed_fulfillment_orders',
  'write_merchant_managed_fulfillment_orders',
  'read_third_party_fulfillment_orders',
  'write_third_party_fulfillment_orders',
  'read_assigned_fulfillment_orders',
  'write_assigned_fulfillment_orders',
  'read_discounts',
  'write_discounts',
  'read_price_rules',
  'write_price_rules',
]

//////////// Helper function //////

const buildRedirectUri = () => `${process.env.appUrl}/shopify/callback`

const buildInstallUrl = (shop, state, redirectUri) =>
  `https://${shop}/admin/oauth/authorize?client_id=${process.env.shopifyApiPublicKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`

const buildAccessTokenRequestUrl = (shop) =>
  `https://${shop}/admin/oauth/access_token`

const buildShopDataRequestUrl = (shop) => `https://${shop}/admin/shop.json`

const generateEncryptedHash = (params) =>
  crypto
    .createHmac('sha256', process.env.shopifyApiSecretKey)
    .update(params)
    .digest('hex')

const fetchAccessToken = async (shop, data) =>
  await axios(buildAccessTokenRequestUrl(shop), {
    method: 'POST',
    data,
  })

const fetchShopData = async (shop, accessToken) =>
  await axios(buildShopDataRequestUrl(shop), {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

const shopify = asyncHandler(async (req, res) => {
  const shop = req.query.shop

  if (!shop) {
    return res.status(400).send('no shop')
  }
  const shopifyToken = new ShopifyToken({
    sharedSecret: process.env.shopifyApiPublicKey,
    redirectUri: process.env.appUrl + '/shopify/callback',
    apiKey: process.env.shopifyApiSecretKey,
  })
  //   const state = nonce()
  //   const state = uuid.v4()
  const state = shopifyToken.generateNonce()
  const installShopUrl = buildInstallUrl(shop, state, buildRedirectUri())

  res.cookie('state', `${state}`) // should be encrypted in production
  res.redirect(installShopUrl)
})

const shopifyCallback = asyncHandler(async (req, res) => {
  const { shop, code, state } = req.query
  //   var headerCookie = req.headers.cookie
  //   console.log(typeof headerCookie)
  //   console.log(typeof state)
  //   if (typeof headerCookie !== 'string') {
  //     headerCookie = `${headerCookie}`
  //   }
  //   console.log(req.headers.cookie)
  //   console.log(typeof req.headers.cookie)
  //   const t = JSON.stringify(req.headers)
  //   console.log(t.cookie)
  //   const stateCookie = cookie.parse(req.headers.cookie).state
  //   console.log(typeof stateCookie)
  //   console.log(stateCookie)
  //   console.log(state)
  //   if (state !== stateCookie) {
  //     return res.status(403).send('Cannot be verified')
  //   }

  const { hmac, ...params } = req.query
  const queryParams = querystring.stringify(params)
  const hash = generateEncryptedHash(queryParams)

  if (hash !== hmac) {
    return res.status(400).send('HMAC validation failed')
  }

  try {
    const data = {
      client_id: process.env.shopifyApiPublicKey,
      client_secret: process.env.shopifyApiSecretKey,
      code,
    }
    const tokenResponse = await fetchAccessToken(shop, data)

    const { access_token } = tokenResponse.data
    console.log(access_token)
    const shopData = await fetchShopData(shop, access_token)
    res.send(shopData.data.shop)
  } catch (err) {
    console.log(err)
    res.status(500).send('something went wrong')
  }
})

module.exports = {
  shopifyCallback,
  shopify,
}
