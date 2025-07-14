const Product = require('../models/product')
// const Cart = require('../models/cart')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const product = require('../models/product')

const ITEM_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems

    Product.find().countDocuments()
        .then(numProducts => {
            totalItems = numProducts
            return Product.find()
                .skip((page - 1) * ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE)
        })

        .then(products => {
            // console.log(products, 'products ??????')
            res.render('shop/index', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEM_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEM_PER_PAGE) //if 11/2 = 5.5 => 6
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
    const page = +req.query.page || 1
    let totalItems

    Product.find().countDocuments()
        .then(numProducts => {
            totalItems = numProducts
            return Product.find()
                .skip((page - 1) * ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE)
        })
        .then(products => {
            // console.log(products, 'products ??????')
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEM_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEM_PER_PAGE) //if 11/2 = 5.5 => 6
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

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            let products = user.cart.items
            let total = 0
            products.forEach(p => {
                total += p.quantity * p.productId.price
            })
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products,
                totalSum: total
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

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId
    Order.findById(orderId)
        .then(order => {
            if (!order) return next(new Error('No order found.'))
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'))
            }

            const invoiceName = `invoice-${orderId}.pdf`
            const invoicePath = path.join('data', 'invoices', invoiceName)

            const pdfDoc = new PDFDocument()
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename=${invoiceName}`)
            pdfDoc.pipe(fs.createWriteStream(invoicePath))
            pdfDoc.pipe(res)

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            })
            pdfDoc.text('--------------')
            let totalPrice = 0
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price
                pdfDoc
                    .fontSize(14)
                    .text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`)
            })
            pdfDoc.text('------')
            pdfDoc
                .fontSize(20)
                .text('Total Price: $' + totalPrice)

            pdfDoc.end();

            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err)
            //     }


            //     res.setHeader('Content-Type', 'application/pdf')
            //     res.setHeader('Content-Disposition', `attachment; filename=${invoiceName}`)
            //     res.send(data)
            // })

            // for bigger file!!!
            // const file = fs.createReadStream(invoicePath)
            // res.setHeader('Content-Type', 'application/pdf')
            // res.setHeader('Content-Disposition', `attachment; filename=${invoiceName}`)

            // file.pipe(res)
        })
        .catch(err => {
            next(err)
        })

}

