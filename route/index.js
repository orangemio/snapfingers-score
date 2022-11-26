const Router = require('koa-router')
const { ethers } = require("ethers")
const helper = require("../helper")
const router = new Router()


router.get('/score/:address', async (ctx, next) => {
    var address
    try {
        address = ethers.utils.getAddress(ctx.params.address)
    } catch (error) {
        ctx.response.body = {
            error: "Error Address"
        }
        ctx.response.status = 500
        return
    }

    ctx.response.body =  await helper.checkUserHistory(address)
    ctx.response.status = 200
})

module.exports = router