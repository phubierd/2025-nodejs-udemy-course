const Product = require('../models/product')
const { validationResult } = require('express-validator')
const fileHelper = require('../util/file')

exports.getAdminProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            })
        }).catch(err => {
            console.log(err, 'err fetch all from db')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postAddProduct = (req, res, next) => {
    const { title, description, price } = req.body
    const image = req.file
    console.log(req.body, 'req body ???')
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            editing: false,
            product: {
                title, description, price
            },
            hasError: true,
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        })
    }

    const imageUrl = image.path
    const product = new Product({ title, price, imageUrl, description, userId: req.user })
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            editing: false,
            product,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    product.save()
        .then(result => {
            console.log(result, 'created product !!!')
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err, 'post add product')
            // return res.status(500).render('admin/edit-product', {
            //     pageTitle: 'Add product',
            //     path: '/admin/add-product',
            //     editing: false,
            //     product,
            //     hasError: true,
            //     errorMessage: 'Database operation failed please try again.',
            //     validationErrors: []
            // })
            // res.redirect('/500')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })

}

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}
exports.getEditProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    const editMod = req.query.edit
    if (!editMod) {
        return res.redirect('/')
    }
    const prodId = req.params.productId;
    console.log(req.params.productId, 'req.params.productId ????')

    Product.findById(prodId)
        .then(product => {
            if (!product) return res.redirect('/')
            res.render('admin/edit-product', {
                pageTitle: 'Add product',
                path: '/admin/edit-product',
                editing: editMod,
                product,
                hasError: false,
                errorMessage: null,
                validationErrors: []

            })
        }).catch(err => {
            console.log(err, 'error find by id getEditProduct ??')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })

}

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, description } = req.body
    const image = req.file
    // const product = new Product(title, price, imageUrl, description, productId)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: productId, title, price, description
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = title
            product.price = price
            if (image) {
                fileHelper.deleteFile(product.imageUrl)
                product.imageUrl = image.path
            }
            product.description = description
            return product.save().then(result => {
                console.log('UPDATED PRODUCT !!!')
                res.redirect('/admin/products')
            })
        })

        .catch(err => {
            console.log(err, 'error find by id postEditProduct ??')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId
    // Product.findByIdAndDelete(prodId)
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found!'))
            }

            fileHelper.deleteFile(product.imageUrl)
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(result => {
            console.log('PRODUCT DESTROY !!!!')
            res.status(200).json({
                message: "Success!"
            })
        })
        .catch(err => {
            res.status(500).json({
                message: 'Delete Product Failed !'
            })
        })
}