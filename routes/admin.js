const express = require('express')
const path = require('path')

const router = express.Router()
const adminController = require('../controllers/admin')

// route => /admin/add-product =>GET
router.get('/add-product', adminController.getAddProduct)
// // admin/products => GET
router.get('/products', adminController.getAdminProducts)
// // route => /admin/add-product =>POST
router.post('/add-product', adminController.postAddProduct)

router.get('/edit-product/:productId', adminController.getEditProduct)
router.post('/edit-product', adminController.postEditProduct)
router.post('/delete-product', adminController.postDeleteProduct)
module.exports = router