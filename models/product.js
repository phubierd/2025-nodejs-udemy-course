const getDb = require('../util/database').getDb
const mongoDb = require('mongodb')
class Product {
    constructor(title, price, imageUrl, description, id, userId) {
        this.title = title
        this.price = price
        this.imageUrl = imageUrl
        this.description = description
        this._id = id ? new mongoDb.ObjectId(id) : null
        this.userId = userId
    }

    save() {
        const db = getDb()
        let dbOp
        if (this._id) {
            //update product
            console.log('GO THISSSSSSSSSSSSSSSSSS')
            dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this })
        } else {
            dbOp = db.collection('products').insertOne(this)
        }
        return dbOp
            .then(result => {
                console.log(result, 'result save ????')
            })
            .catch(err => {
                console.log(err, 'error save to db>>>>>>')
            })
    }

    static fetchAll() {
        const db = getDb()
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products)
                return products
            })
            .catch(err => {
                console.log(err, 'err fetch all product ???')
            })
    }

    static findById(id) {
        const db = getDb();
        return db.collection('products')
            .find({ _id: new mongoDb.ObjectId(id) })
            .next()
            .then(product => {
                return product
            })
            .catch(err => console.log(err, 'error find by id ?????'))
    }

    static deleteById(id) {
        const db = getDb();
        return db.collection('products')
            .deleteOne({ _id: new mongoDb.ObjectId(id) })
            .then(result => {
                console.log('DELETEDDDDDDDD')
            })
            .catch(err => {
                console.log(err, 'error delete by id ???')
            })
    }
}


module.exports = Product