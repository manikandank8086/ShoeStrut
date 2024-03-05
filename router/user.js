const express = require('express')
const router = express.Router()
const userController = require('../controller/user')
const { route } = require('./admin')
const {userAuthentication}=require('../middleware/userAuth')



router.get('/',userController.loginGet)

router.post('/login',userController.loginPost)

router.get('/signup',userController.signupGet)

router.post('/signup',userController.signupPost)

router.get('/otp',userController.otpGet)

router.post('/otp',userController.otpPost)

router.get('/resendOTP',userController.resendOTP)


router.get('/home',userAuthentication,userController.homeGet)


router.get('/profile', userAuthentication,userController.profileGet)

router.post('/addressSave',userAuthentication, userController.addressSave);

router.post('/addressEdit/:id',userAuthentication,userController.addressEditPost)

router.get('/addAddress', userAuthentication,userController.addAddressGet)

router.get('/addressEdit/:id', userAuthentication,userController.addressEditGet)

router.get('/addAddressProfile',userAuthentication,userController.AddaddressProfile)

router.post('/addAddressProfile',userAuthentication,userController.AddaddressProfileSave)

router.post('/profileNewPassword/:id',userAuthentication,userController.AddressDetails)

router.get('/successPage', userAuthentication,userController.successPageGet)

router.post('/orderCOD',userAuthentication,userController.orderCOD)

router.get('/orderDetails/:id',userAuthentication,userController.ordreDetailsGet)



router.post('/orderCancel/:id',userAuthentication,userController.orderCancel)





router.get('/forgotPassword',userController.forgotGet)

router.post('/forgotPasswordPost',userController.forgotPost)

router.get('/resetPassword',userController.resetGet)

router.post('/resetPasswordPost',userController.resetPost)

router.get('/logout',userController.Logout)

module.exports =router