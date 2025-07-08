const express = require('express')
const bodyParser = require('body-parser')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const path = require('path')
const errorController = require('./controllers/error')
const mongoose = require('mongoose')
const User = require('./models/user')

const app = express();

// EJS
app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User.findById('686b7229cb2d9022eb819fc3')
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => {
            console.log(err, 'error find user id')
        })
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404)

mongoose
    .connect('mongodb+srv://phubierd:XrrhZeFASamyuSEr@cluster0.9gg8thh.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'PhuCT',
                        email: 'phuct@gmail.com',
                        cart: {
                            items: []
                        }
                    })
                    user.save()
                }
            })
            .catch(err => {
                console.log(err, 'error find one user ???')
            })

        app.listen(3000)
    })
    .catch(err => {
        console.log(err, 'error connect mongoose')
    })