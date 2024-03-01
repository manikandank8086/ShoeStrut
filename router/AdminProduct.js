const express = require('express')
const router = express.Router()
const AdminProductController=require('../controller/productController')
const { upload } = require("../helper/multer");
const { route } = require('./admin');
const { adminAuthentication } = require('../middleware/adminAuth');

router.get("/list", AdminProductController.productGet);

router.get("/add", AdminProductController.addProductGet);

router.post(
    "/push",
    upload.single("image"),
    AdminProductController.productPushPost
  );

  router.get("/productList", AdminProductController.productListGet);

  router.get("/productListEdit/:id", AdminProductController.productListEditGet);

  router.get("/delete/:id", AdminProductController.productDeleteGEt);

  router.post("/productEdit/:id", AdminProductController.productEditPost);

  router.get("/user/list", AdminProductController.userListGet);

  router.get("/blockUser",AdminProductController.blockUserGet);



  router.get('/orderList',AdminProductController.orderList)

  router.get('/OrderSearch',AdminProductController.OrderSearch)
  
  router.post('/changeStatus', AdminProductController.changeStatus)

  router.get('/orderDelete/:id',AdminProductController.orderDelete)

  router.get('/orderDetails/:id',AdminProductController.OrderDetails)



module.exports=router