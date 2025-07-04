const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db;

const mongoConnect = (callback) => {

    MongoClient.connect('mongodb+srv://phubierd:XrrhZeFASamyuSEr@cluster0.9gg8thh.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
        .then(client => {
            console.log('CONNECTED')
            _db = client.db()
            callback()
        })
        .catch(err => {
            console.log(err, 'error connect mongodb')
            throw err
        }
        )
}

const getDb = () => {
    if (_db) {
        return _db
    }
    throw 'No Database found!'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb