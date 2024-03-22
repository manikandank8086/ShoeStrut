const express = require("express");
const router = express.Router();
const AdminProductController = require("../controller/adminProduct");
const AdminCouponController = require('../controller/adminCoupon')
const { upload } = require("../helper/multer");
const { route } = require("./admin");
const { adminAuthentication } = require("../middleware/adminAuth");

router.get("/list", adminAuthentication, AdminProductController.productGet);

router.get("/add", AdminProductController.addProductGet);

router.post(
  "/push",
  upload.single("image"),
  AdminProductController.productPushPost
);

router.get("/productList", adminAuthentication,AdminProductController.productListGet);

router.get("/productListEdit/:id",adminAuthentication, AdminProductController.productListEditGet);


router.post('/productEdit/:id', upload.single('image'),AdminProductController.productEditPost);

router.delete('/editDeleteImage:id',adminAuthentication,AdminProductController.editDeleteImg)

router.get("/user/list",adminAuthentication, AdminProductController.userListGet);

router.get("/blockUser",adminAuthentication, AdminProductController.blockUserGet);

router.get("/orderList",adminAuthentication, AdminProductController.orderList);

router.get("/OrderSearch", adminAuthentication,AdminProductController.OrderSearch);

router.post("/changeStatus",adminAuthentication, AdminProductController.changeStatus);

router.get("/orderDelete/:id",adminAuthentication, AdminProductController.orderDelete);

router.get("/orderDetails/:id", adminAuthentication,AdminProductController.OrderDetails);

router.post('/confirmReturn/:id', adminAuthentication, AdminProductController.confirmReturn);

router.get('/reject/:id', adminAuthentication, AdminProductController.rejectReturn);



// coupon 

router.get('/coupon',adminAuthentication,AdminCouponController.CouponGet)

router.get('/couponList',adminAuthentication,AdminCouponController.couponList)

router.post('/addCoupon',adminAuthentication,AdminCouponController.addCoupon)

router.get('/blocCoupon',adminAuthentication,AdminCouponController.blockCoupon)

//sales Report

router.get('/SalesReport',adminAuthentication,AdminProductController.salesReport)

router.post('/dateSearch',adminAuthentication,AdminProductController.dateSearch)

router.post('/excel',adminAuthentication,AdminProductController.excelDownload)


module.exports = router;
