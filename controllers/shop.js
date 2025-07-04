const Product = require('../models/product')
// const Cart = require('../models/cart')
// const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        })
    }).catch(err => console.log(err, 'error find all getProducts ??'))
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
    })
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(products => {
        // console.log(products, 'products ??????')
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
        })
    }).catch(err => console.log(err, 'error find all get index ??'))
}

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(products => {
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products
            })

        })

        .catch(err => {
            err, 'error get cart ???'
        })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    req.user.deleteItemFromCart(prodId)
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err, 'error get cart delete product ???')
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
            console.log(err, 'error find product by id ??')
        })
}

exports.getOrders = (req, res, next) => {
    req.user.getOrder()
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders
            })
        })
        .catch(err => console.log(err, 'get error orders'))
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Check Out',
        path: '/checkout'
    })
}

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then(result =>
            res.redirect('/orders')
        )
        .catch(err => {
            console.log(err, 'error post order get cart')
        })
}