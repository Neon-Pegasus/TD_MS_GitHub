const sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new sequelize(process.env.DB_URL);

sequelize.authenticate()
.then(() => {
  console.log('Connection has been established successfully');
})
.catch(err => console.error('Unable to connect to the database:', err));

