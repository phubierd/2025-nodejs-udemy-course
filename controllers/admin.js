const Product = require('../models/product')

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
        }).catch(err => console.log(err, 'err fetch all from db'))
}

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, description, price } = req.body
    console.log(req.body, 'req body ???')
    const product = new Product({ title, price, imageUrl, description, userId: req.user })
    product.save()
        .then(result => {
            console.log(result, 'created product !!!')
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err, 'post add product'))

}

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: false,
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
            })
        }).catch(err => {
            console.log(err, 'error find by id getEditProduct ??')
        })

}

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, imageUrl, description } = req.body
    // const product = new Product(title, price, imageUrl, description, productId)
    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = title
            product.price = price
            product.imageUrl = imageUrl
            product.description = description
            return product.save().then(result => {
                console.log('UPDATED PRODUCT !!!')
                res.redirect('/admin/products')
            })
        })

        .catch(err => {
            console.log(err, 'error find by id postEditProduct ??')
        })
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    // Product.findByIdAndDelete(prodId)
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log('PRODUCT DESTROY !!!!')
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err, 'error post delete product ???')
        })
}