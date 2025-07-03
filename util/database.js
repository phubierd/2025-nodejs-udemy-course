// const mysql = require('mysql2')

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '1231',
//     database: 'database-complete'
// })

// module.exports = pool.promise()


const Sequelize = require('sequelize')

const sequelize = new Sequelize('database-complete', 'root', '1231', { dialect: 'mysql', host: 'localhost' });

module.exports = sequelize
