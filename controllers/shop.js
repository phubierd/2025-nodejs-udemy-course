const Product = require('../models/product')
const Cart = require('../models/cart')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
    // Product.fetchAll((products) => {
    //     res.render('shop/product-list', {
    //         prods: products,
    //         pageTitle: 'All Products',
    //         path: '/products',
    //     })
    // })

    // my sql
    // Product.fetchAll().then(result => {
    //     res.render('shop/product-list', {
    //         prods: result[0],
    //         pageTitle: 'All Products',
    //         path: '/products',
    //     })
    // }).catch(err => {
    //     console.log(err, 'fetch all error from db ??')
    // })

    //sequelize
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        })
    }).catch(err => console.log(err, 'error find all getProducts ??'))
}
exports.getProductDetail = (req, res, next) => {
    const proId = req.params.productId
    // Product.findById(proId, (product) => {
    //     console.log(product, '????')
    //     res.render('shop/product-detail', {
    //         product,
    //         pageTitle: product.title,
    //         path: `/products`,
    //     })
    // })

    // my sql
    // Product.findById(proId).then(([product]) => {
    //     console.log(product, 'product ???')
    //     res.render('shop/product-detail', {
    //         product: product[0],
    //         pageTitle: product.title,
    //         path: `/products`,
    //     })
    // }).catch(err => {
    //     console.log(err, 'err find by id DB')
    // })


    //sequelize
    Product.findByPk(proId).then((product) => {
        // Product.findAll({
        //     where: {
        //         id: proId
        //     }
        // }).then(item => {
        //     console.log(item[0], 'itemmmmmm')
        // }).catch(err => {
        //     console.log(err, 'error fetch all by id')
        // })
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
    // Product.fetchAll((products) => {
    //     res.render('shop/index', {
    //         prods: products,
    //         pageTitle: 'Shop',
    //         path: '/',
    //     })
    // })

    //my sql
    // Product.fetchAll().then(result => {
    //     res.render('shop/index', {
    //         prods: result[0],
    //         pageTitle: 'Shop',
    //         path: '/',
    //     })
    // }).catch(err => {
    //     console.log(err, 'fetch all error from db ??')
    // })

    //sequelize
    Product.findAll().then(products => {
        console.log(products, 'products ??????')
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
        })
    }).catch(err => console.log(err, 'error find all get index ??'))
}

exports.getCart = (req, res, next) => {
    // Cart.getCart(cart => {
    //     Product.fetchAll((products => {
    //         const cartProducts = []
    //         for (product of products) {
    //             const cartProductData = cart.products.find(prod => prod.id === product.id)
    //             if (cartProductData) {
    //                 cartProducts.push({ productData: product, qty: cartProductData.qty })
    //             }
    //         }
    //         res.render('shop/cart', {
    //             pageTitle: 'Your Cart',
    //             path: '/cart',
    //             products: cartProducts
    //         })
    //     }))
    // })

    //sequelize
    console.log(req.user.cart, 'user cart ?????')
    req.user.getCart()
        .then(cart => {
            console.log(cart, 'cart ????')
            return cart.getProducts()
                .then(products => {
                    console.log(products, 'products in cart ?????')
                    res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products
                    })
                })
                .catch(err => {
                    console.log(err, 'error get products in cart ????')
                });
        })

        .catch(err => {
            err, 'error get cart ???'
        })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    // Product.findById(prodId, product => {
    //     Cart.deleteProduct(prodId, product.price)
    //     res.redirect('/cart')
    // })

    //sequelize
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({
                where: {
                    id: prodId
                }
            })
        })
        .then(products => {
            const product = products[0]
            return product.cartItem.destroy()
        })
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err, 'error get cart delete product ???')
        })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    let fetchedCart
    let newQuantity = 1;
    // Product.findById(productId, (product) => {
    //     Cart.addProduct(productId, product.price)
    // })
    // res.redirect('/cart')

    //sequelize
    req.user.getCart()
        .then(cart => {
            console.log(req.user, 'REQ USERRRRRRRRRRRRRRRRRRRRRR')
            fetchedCart = cart
            return cart.getProducts({
                where: {
                    id: productId
                }
            })
        })
        .then(products => {
            let product
            if (products.length > 0) {
                product = products[0]
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1
                return product
            }
            return Product.findByPk(productId)
        })
        .then(product => {

            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            })
        })
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => console.log(err, 'error post cart ??????'))
}

exports.getOrders = (req, res, next) => {
    // res.render('shop/orders', {
    //     pageTitle: 'Your Orders',
    //     path: '/orders'
    // })
    req.user.getOrders({ include: ['products'] })
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
    let fetchedCart
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart
            return cart.getProducts()
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderItem = {
                            quantity: product.cartItem.quantity
                        }
                        return product
                    }))
                })
                .catch(err => {
                    console.log(err, 'error create order ?????')
                });
        })
        .then(result => {
            return fetchedCart.setProducts(null)
        })
        .then(result =>
            res.redirect('/orders')
        )
        .catch(err => {
            console.log(err, 'error post order get cart')
        })
}