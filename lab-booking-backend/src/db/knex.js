import knexLib from 'knex';
import config from '../config/index.js';

const db = knexLib({
  client: 'pg',
  connection: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
  },
  pool: { min: 2, max: 10 },
});

export default db;
