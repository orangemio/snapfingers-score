const got = require("got")
const pool = require("../utils/db")
const Moralis = require('moralis').default
const { EvmChain } = require('@moralisweb3/evm-utils')

async function checkUserHistory(address) {

    await pool.none(
        `
            INSERT INTO scores (
            "user"
            ) VALUES (
            '${address}'
            ) ON CONFLICT DO NOTHING
          `
    )
    const db_result = await pool.query(`SELECT * FROM scores WHERE "user" = '${address}'`)

    const result = new Date() - new Date(db_result[0].updatedAt)

    // 查询间隔 600s
    if (result <= 600000 && (db_result[0].updatedAt.toString() != db_result[0].createdAt.toString())) {
        return {
            data: db_result[0]
        }
    }
    const userData = db_result[0]

    if (!userData.bab_bsc) {
        userData.bab_bsc = await checkBABStatus(userData.user)
    }
    if (!userData.ens_eth) {
        userData.ens_eth = await checkENSStatus(userData.user)
    }
    if (!userData.ens_resolved_eth) {
        userData.ens_resolved_eth = await checkENSResloved(userData.user)
    }
    if (!userData.uniswap_swap_eth || !userData.uniswap_liquidity_eth || !userData.used_3_dex_eth) {
        const data = await checkSwapStatus(userData.user)
        userData.uniswap_swap_eth = data.uni_swap
        userData.uniswap_liquidity_eth = data.uni_liquidity
        userData.used_3_dex_eth = data.used_3_dex

    }

    await pool.none(
        `
            UPDATE scores
            SET 
            "bab_bsc" = ${userData.bab_bsc},
            "ens_eth" = ${userData.ens_eth},
            "ens_resolved_eth" = ${userData.ens_resolved_eth},
            "uniswap_swap_eth" = ${userData.uniswap_swap_eth},
            "uniswap_liquidity_eth" = ${userData.uniswap_liquidity_eth},
            "used_3_dex_eth" = ${userData.used_3_dex_eth},
            "updatedAt" = now()
            WHERE "user" = '${userData.user}'
            `
    )

    return {
        data: userData
    }

}


async function checkBABStatus(address) {

    await Moralis.start({
        apiKey: '1KUrTgmIhCFBGcPnho6ebLCWbhq6ApWKfLh2ipaWbclwoYpgj8p19zdY98Lm9XuL',
    })

    const chain = EvmChain.BSC;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain,
        tokenAddresses: ["0x2b09d47d550061f995a3b5c6f0fd58005215d7c8"]
    });
    if (response.data.total >= 1) {
        return true
    }

    return false
}

async function checkENSStatus(address) {

    await Moralis.start({
        apiKey: '1KUrTgmIhCFBGcPnho6ebLCWbhq6ApWKfLh2ipaWbclwoYpgj8p19zdY98Lm9XuL',
    })

    const chain = EvmChain.ETHEREUM;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain,
        tokenAddresses: ["0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"]
    });
    if (response.data.total >= 1) {
        return true
    }

    return false
}

async function checkENSResloved(address) {

    await Moralis.start({
        apiKey: '1KUrTgmIhCFBGcPnho6ebLCWbhq6ApWKfLh2ipaWbclwoYpgj8p19zdY98Lm9XuL',
    })

    const response = await Moralis.EvmApi.resolve.resolveAddress({
        address
    });

    if (response) {
        return true
    }
    return false

}

async function checkSwapStatus(address) {
    let uni_swap = false
    let uni_liquidity = false
    let used_3_dex = false
    let used_aggregator = false
    let platforms = []
    try {
        const data = await got(`https://pregod.rss3.dev/v1/notes/${address}?limit=500&type=swap&type=liquidity&tag=exchange&network=ethereum`, {
        }).json()


        if (data.total == 0) {
            return (uni_swap, uni_liquidity)
        }

        for (let index = 0; index < data.result.length; index++) {

            platforms = compare(platforms, data.result[index].platform)

            if (data.result[index].platform == 'Uniswap' && data.result[index].type == 'swap' && !uni_swap) {
                uni_swap = true
            }
            if (data.result[index].platform == 'Uniswap' && data.result[index].type == 'liquidity' && !uni_liquidity) {
                uni_liquidity = true
            }

            if (platforms.length >= 3) {
                used_3_dex = true
            }

            if (uni_liquidity && uni_swap && used_3_dex) {
                break
            }
        }

        return { uni_swap, uni_liquidity, used_3_dex }
    } catch (e) {
        return { uni_swap, uni_liquidity, used_3_dex }
    }
}


function compare(data, platform) {

    var flag = false;
    for (var i = 0; i < data.length; i++) {
        if (data[i] == platform) {
            flag = true
            break
        }
    }
    if (flag == false) {
        data.push(platform);
    }

    return data

}

module.exports = {
    checkUserHistory
}