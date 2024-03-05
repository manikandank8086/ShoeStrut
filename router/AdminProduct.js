const express = require("express");
const router = express.Router();
const AdminProductController = require("../controller/productController");
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

router.get("/delete/:id", adminAuthentication,AdminProductController.productDeleteGEt);

router.post("/productEdit/:id",adminAuthentication, AdminProductController.productEditPost);

router.get("/user/list",adminAuthentication, AdminProductController.userListGet);

router.get("/blockUser",adminAuthentication, AdminProductController.blockUserGet);

router.get("/orderList",adminAuthentication, AdminProductController.orderList);

router.get("/OrderSearch", adminAuthentication,AdminProductController.OrderSearch);

router.post("/changeStatus",adminAuthentication, AdminProductController.changeStatus);

router.get("/orderDelete/:id",adminAuthentication, AdminProductController.orderDelete);

router.get("/orderDetails/:id", adminAuthentication,AdminProductController.OrderDetails);

module.exports = router;
