const Product = require('../models/product')

exports.getAdminProducts = (req, res, next) => {
    // Product.fetchAll((products) => {
    //     res.render('admin/products', {
    //         prods: products,
    //         pageTitle: 'Admin Products',
    //         path: '/admin/products',
    //     })
    // })

    // mysql
    // Product.fetchAll().then(result => {
    //     res.render('admin/products', {
    //         prods: result[0],
    //         pageTitle: 'Admin Products',
    //         path: '/admin/products',
    //     })
    // }).catch(err => { console.log(err, 'err fetch all from db') })

    //sequelize
    // Product.findAll()
    req.user.getProducts()
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
    // local file
    // const product = new Product(null, title, imageUrl, description, price)
    // product.save()
    // res.redirect('/');

    //my sql
    // product.save().then(result => {
    //     console.log(result, 'result save product ???')
    //     res.redirect('/')
    // }).catch(err => console.log(err, 'err save product'))

    //sequelize
    // const product = new Product(null, title, imageUrl, description, price)
    // Product.create({
    //     title,
    //     imageUrl,
    //     description,
    //     price,
    // })

    //create product by user id
    req.user.createProduct({
        title,
        imageUrl,
        description,
        price,
    })
        .then(result => {
            console.log('created product !!!')
            res.redirect('/admin/products')
        }).catch(err => console.log(err, 'post add product'))
}

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: false
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
    // Product.findById(prodId, (product) => {
    //     if (!product) return res.redirect('/')
    //     res.render('admin/edit-product', {
    //         pageTitle: 'Add product',
    //         path: '/admin/edit-product',
    //         editing: editMod,
    //         product
    //     })
    // })

    //sequelize

    // Product.findByPk(prodId)
    // .then(product => {
    req.user.getProducts({ where: { id: prodId } })
        .then(products => {
            const product = products[0]
            if (!product) return res.redirect('/')
            res.render('admin/edit-product', {
                pageTitle: 'Add product',
                path: '/admin/edit-product',
                editing: editMod,
                product
            })
        }).catch(err => {
            console.log(err, 'error find by id getEditProduct ??')
        })

}

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, imageUrl, description } = req.body
    // const updatedProduct = new Product(productId, title, imageUrl, description, price)
    // updatedProduct.save();
    // res.redirect('/admin/products')

    //sequelize
    Product.findByPk(productId)
        .then(product => {
            product.title = title
            product.price = price
            product.imageUrl = imageUrl
            product.description = description
            return product.save()
        })
        .then(result => {
            console.log('UPDATED PRODUCT !!!')
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err, 'error find by id postEditProduct ??')
        })
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    // Product.deleteById(prodId)
    // res.redirect('/admin/products')

    //sequelize
    Product.findByPk(prodId)
        .then(product => {
            console.log(product, 'delete this ????????????')
            return product.destroy()
        })
        .then(result => {
            console.log('PRODUCT DESTROY !!!!')
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err, 'error post delete product ???')
        })
}