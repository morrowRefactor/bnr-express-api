const app = require('./app');
const knex = require('knex');

const { PORT, DATABASE_URL, NODE_ENV } = require('./config');

if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
}); 

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
});