const express = require('express')
const router = express.Router()
const UserProductController=require('../controller/UserProduct')
const UserCartController=require('../controller/UserCart')
const { route } = require('./admin')
const {userAuthentication}=require('../middleware/userAuth')

router.get('/details/:id',userAuthentication,UserProductController.productDetailsGet)

// router.get('/addToCartSize',userAuthentication,UserProductController.sizeAdd)

router.post('/ratings',userAuthentication,UserProductController.Ratings)

router.post('/star',userAuthentication,UserProductController.Star)


router.get('/shop',userAuthentication,UserProductController.shopGet)

router.get('/categoryFiltering',userAuthentication,UserProductController.CategoryFilter)

router.post('/ShopPageSort',userAuthentication, UserProductController.ShopSort);

router.post('/shopSearch', userAuthentication,UserProductController.ShopSearch);





router.get('/cart',userAuthentication,UserCartController.cartGet)

router.get('/addcart/:id',userAuthentication,UserCartController.cartAdd)
    
router.post('/updateQuantity/:id',userAuthentication,UserCartController.qtyUp)
router.get('/getQuantity/:id',userAuthentication,UserCartController.qtyUpdation)

router.delete('/remove/:id', userAuthentication,UserCartController.removeDelete);

router.get('/checkout',userAuthentication,UserCartController.checkoutGet)

router.get('/checkout/verify',userAuthentication,UserCartController.checkVerify)





module.exports=router