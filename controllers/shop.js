const Product = require('../models/product')
// const Cart = require('../models/cart')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            console.log(products, 'productssssssssssssss')
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
            })
        }).catch(err => {
            console.log(err, 'error find all getProducts ??')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getProductDetail = (req, res, next) => {
    const proId = req.params.productId
    Product.findById(proId).then((product) => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: `/products`,
        })
    }).catch(err => {
        console.log(err, 'err find by id DB')
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            // console.log(products, 'products ??????')
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
            })
        }).catch(err => {
            console.log(err, 'error find all get index ??')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            let products = user.cart.items
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products,
            })

        })

        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err, 'error get cart delete product ???')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            console.log(result, 'result add to cart ????')
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err, 'error add to cart ??')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders,
            })
        })
        .catch(err => {
            console.log(err, "err find all orders ???")
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Check Out',
        path: '/checkout'
    })
}

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => (
                {
                    quantity: item.quantity,
                    product: { ...item.productId._doc }
                }
            ))
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products
            })
            return order.save()
        })
        .then(result => {
            return req.user.clearCart()
        }
        ).then(result => {
            res.redirect('/orders')

        })
        .catch(err => {
            console.log(err, 'error get product by user populate')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}