const crypto = require('crypto')
const User = require('../models/user');
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')

// const nodemailer = require('nodemailer')
// const sendgridTransport = require('nodemailer-sendgrid-transport')

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth: {
//         api_key: '',
//     }
// }))

exports.getLogin = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: '',
            password: ''
        }
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email, password
            },
            validationErrors: errors.array()
        })
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                // req.flash('error', 'Invalid email or password.')
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email, password
                    },
                    validationErrors: errors.array()
                })
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        return req.session.save((err) => {
                            console.log(err, 'error req.session save !!')
                            return res.redirect('/')
                        })
                    }
                    // req.flash('error', 'Invalid email or password')
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email, password
                        },
                        validationErrors: errors.array()
                    })
                })
                .catch(err => {
                    console.log(err, 'error compare password')
                })

        })
        .catch(err => {
            console.log(err, 'err login ???')
        })
}

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array(), 'error ???????')
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password,
                confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    bcrypt.hash(password, 12).then(hasedPassword => {
        const user = new User({
            email,
            password: hasedPassword,
            cart: {
                items: []
            }
        })
        return user.save()
    })
        .then(() => {
            console.log('user CREATED!!')
            return res.redirect('/login')
            // return transporter.sendMail({
            //     to: email,
            //     from: 'shop@node-complete.com',
            //     subject: 'Signup Success',
            //     html: '<h1>You successfully signed up!</h1>'
            // })
        })
        .catch(err => console.log(err, 'error send mail'))
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err, 'err logout ??')
        res.redirect('/')
    })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err, 'error random buffer')
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 36000000;
                return user.save()
            })
            .then(result => {
                res.redirect('/')
                // transporter.sendMail({
                //     to: req.body.email,
                //     from: 'shop@node-complete.com',
                //     subject: 'Password Reset',
                //     html: `
                //     <p>You requested password reset</p>
                //     <p>Click this <a href='http://localhost:300/reset/${token}'>link</a> to set a new password.</p>
                //     `
                // })
            })
            .catch(err => {
                console.log(err, 'error find user ???')
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error')
            if (message.length > 0) {
                message = message[0]
            } else {
                message = null
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });


        })
        .catch(err => {
            console.log(err, 'error find user by token')
        })
}

exports.postNewPassword = (req, res, next) => {
    const { password, userId, passwordToken } = req.body
    console.log(req.body, '???')
    let resetUser

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then(user => {
            console.log(user, 'user ???????')
            resetUser = user
            return bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save()
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => {
            console.log(err, 'error reset password')
        })
}