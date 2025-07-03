const express = require('express')
const bodyParser = require('body-parser')
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const path = require('path')
const errorController = require('./controllers/error')
const sequelize = require('./util/database')

const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const app = express();


// handlebars engine
// app.engine('.hbs', expressHbs.engine({ extname: '.hbs', layoutsDir: 'views/layouts/', defaultLayout: 'main-layout' }));
// app.set('view engine', '.hbs')
// app.set('views', path.join(__dirname, 'views'))

// EJS
app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User.findByPk(1)
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

Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
})
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, {
    through: CartItem
})
Product.belongsToMany(Cart, {
    through: CartItem
})
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })


sequelize
    // .sync({
    //     force: true,
    // })
    .sync()
    .then(result => {
        return User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'PhuCT',
                email: 'phuct@gmail.com',

            })
        }
        return user
    })
    .then(user => {
        // console.log(user, 'user info ????????')
        return user.createCart();
    })
    .then(cart => {
        app.listen(3000)

    })
    .catch(err => {
        console.log(err, 'error sequelize sync ??')
    })
