// const fs = require('fs')
// const path = require('path')
// const Cart = require('./cart')
// const db = require('../util/database')

// const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

// const getProductsFromFile = (cb) => {
//     fs.readFile(p, (err, fileContent) => {
//         if (err) {
//             return cb([])
//         } else {
//             cb(JSON.parse(fileContent))
//         }
//     })
// }

// // get data from db


// module.exports = class Product {
//     constructor(id, title, imageUrl, description, price) {
//         this.id = id
//         this.title = title
//         this.imageUrl = imageUrl,
//             this.description = description,
//             this.price = price
//     }

//     // data from local FILE
//     // save() {
//     //     getProductsFromFile(products => {
//     //         if (this.id) {
//     //             const index = products.findIndex(it => it.id === this.id)
//     //             const updatedProducts = [...products]
//     //             updatedProducts[index] = this
//     //             fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//     //                 console.log(err, 'write file error ????')
//     //             })
//     //         } else {
//     //             this.id = Math.random().toString();
//     //             products.push(this)
//     //             fs.writeFile(p, JSON.stringify(products), (err) => {
//     //                 console.log(err, 'write file error ????')
//     //             })
//     //         }
//     //     })
//     // }

//     // static fetchAll(cb) {
//     //     getProductsFromFile(cb)
//     // }

//     // static findById(id, cb) {
//     //     getProductsFromFile(products => {
//     //         const product = products.find(it => it.id === id)
//     //         cb(product)
//     //     })
//     // }

//     // static deleteById(id) {
//     //     getProductsFromFile(products => {
//     //         const product = products.find(prod => prod.id === id)
//     //         const updatedProducts = products.filter(prod => prod.id !== id)
//     //         fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//     //             if (!err) {
//     //                 Cart.deleteProduct(id, product.price)
//     //             }
//     //         })
//     //     })
//     // }


//     // data from DB
//     save() {
//         return db.execute('INSERT INTO products (title,price,imageUrl,description) VALUE (?,?,?,?)', [this.title, this.price, this.imageUrl, this.description])
//     }
//     static fetchAll() {
//         return db.execute('SELECT * FROM products')
//     }

//     static findById(id) {
//         return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
//     }

//     static deleteById(id) {

//     }
// }



// ======================== SEQUELIZE
const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Product