const express = require('express')
const router = express.Router()
const UserProductController=require('../controller/shop')
const UserCartController=require('../controller/cart')
const CouponController = require('../controller/coupon')
const { route } = require('./admin')
const {userAuthentication}=require('../middleware/userAuth')

//profile details
router.get('/details/:id',userAuthentication,UserProductController.productDetailsGet)

router.post('/ratings',userAuthentication,UserProductController.Ratings)

router.post('/star',userAuthentication,UserProductController.Star)

router.put('/editReview',userAuthentication,UserProductController.editReview)

router.delete('/reviewDelete/:id',userAuthentication,UserProductController.deleteReview)

//shop
router.get('/shop',userAuthentication,UserProductController.shopGet)

router.get('/categoryFiltering',userAuthentication,UserProductController.CategoryFilter)

router.post('/ShopPageSort',userAuthentication, UserProductController.ShopSort);

router.post('/shopSearch', userAuthentication,UserProductController.ShopSearch);

//whislist
router.get('/wishlist',userAuthentication,UserProductController.whislistGet)

router.get('/addWhislis/:id',userAuthentication,UserProductController.addWhislist)

router.get('/addToCartWishlist/:id',userAuthentication,UserProductController.addToCartWislist)

router.delete('/remove-wishlist/:id/',userAuthentication,UserProductController.removeWishlist)


//cart
router.get('/cart',userAuthentication,UserCartController.cartGet)

router.get('/addcart/:id',userAuthentication,UserCartController.cartAdd)
    
router.post('/updateQuantity/:id',userAuthentication,UserCartController.qtyUp)

router.get('/getQuantity/:id',userAuthentication,UserCartController.qtyUpdation)

router.delete('/remove/:id', userAuthentication,UserCartController.removeDelete);

router.get('/checkout',userAuthentication,UserCartController.checkoutGet)

router.get('/checkout/verify',userAuthentication,UserCartController.checkVerify)


//Coupon

router.post('/apply-coupon',userAuthentication,CouponController.applyCoupon)

router.post('/remove-coupon',userAuthentication,CouponController.RemoveCoupon)







module.exports=router