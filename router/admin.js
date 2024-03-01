const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const adminCategoryController = require("../controller/AdminCategoryController")
const { upload } = require("../helper/multer");
const { adminAuthentication } = require("../middleware/adminAuth");

router.get("/", adminController.loginGet);

router.get("/logout", adminController.logoutGet);

router.post("/login", adminController.loginPost);

router.get("/adminHome", adminAuthentication, adminController.homeGet);





 // Category

router.get("/category", adminCategoryController.categoryGet);

router.get("/categoryList", adminCategoryController.categoryListGet);

router.get("/editCategory/:id", adminCategoryController.editCategoryGet);

router.post("/categoryEdited/:id", adminCategoryController.categoryEditPost);

router.post("/create/categoty", adminCategoryController.categoryPost);



module.exports = router;
