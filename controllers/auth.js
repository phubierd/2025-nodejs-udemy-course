const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie'), '??????')
    // const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1] === 'true'
    console.log(req.session.isLoggedIn, '????')
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/auth/login',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    User.findById('686b7229cb2d9022eb819fc3')
        .then(user => {
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.save((err) => {
                console.log(err, 'error req.session save !!')
                res.redirect('/')
            })
        })
        .catch(err => {
            console.log(err, 'err login ???')
        })
    // const { email, password } = req.body
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err, 'err logout ??')
        res.redirect('/')
    })

}