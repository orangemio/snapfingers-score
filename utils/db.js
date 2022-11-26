const PgPromise = require("pg-promise");
const config = require("../config")
const pgp = PgPromise();

const pool = pgp({
  connectionString: config.databaseUrl,
  keepAlive: true,
  max: 60,
  connectionTimeoutMillis: 10 * 1000,
  query_timeout: 10 * 1000,
  statement_timeout: 10 * 1000,
  allowExitOnIdle: true
});

module.exports = pool