const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const adminCategoryController = require("../controller/AdminCategoryController");
const { upload } = require("../helper/multer");
const { adminAuthentication } = require("../middleware/adminAuth");

router.get("/", adminController.loginGet);

router.get("/logout", adminController.logoutGet);

router.post("/login", adminController.loginPost);

router.get("/adminHome", adminAuthentication, adminController.homeGet);

// Category

router.get("/category", adminAuthentication,adminCategoryController.categoryGet);

router.get("/categoryList", adminAuthentication,adminCategoryController.categoryListGet);

router.get("/editCategory/:id", adminAuthentication, adminCategoryController.editCategoryGet);

router.post("/categoryEdited/:id", adminAuthentication,adminCategoryController.categoryEditPost);

router.post("/create/categoty", adminAuthentication, adminCategoryController.categoryPost);

module.exports = router;
