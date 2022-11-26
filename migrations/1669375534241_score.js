/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('scores', {
        id: 'id',
        user: {
            type: 'varchar(42)',
            notNull: true,
            unique: true
        },
        bab_bsc: {
            type: 'bool',
            notNull: true,
            default: false
        },
        ens_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        ens_resolved_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        ens_resolved_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        uniswap_swap_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        uniswap_liquidity_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        used_3_dex_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        galxe_passport_bsc: {
            type: 'bool',
            notNull: true,
            default: false
        },
        galxe_partners_polygon: {
            type: 'bool',
            notNull: true,
            default: false
        },
        curve_eth: {
            type: 'bool',
            notNull: true,
            default: false
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updatedAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
    pgm.sql(`ALTER DATABASE snapshots SET timezone TO 'Asia/Shanghai';`)
    // pgm.createIndex('posts', 'userId')
}

exports.down = pgm => {
    return pgm.dropTable('scores');
};
