const { render } = require("ejs");
const { adminModel } = require("../model/adminModel");
const { User } = require("../model/userModel");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const mongoose = require("mongoose");
const session = require("express-session");

const loginGet = async (req, res) => {
  try {
    if (req.session.adminId) {
      res.render("admin/adminHome");
    } else if (req.session.adminCheck) {
      req.session.adminCheck = null;
      res.render("admin/adminLogin", { message: "Incorrect Password" });
    } else {
      res.render("admin/adminLogin", { message: "" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminDetails = await adminModel.findOne({ email: email });
    if (!adminDetails) {
      res.redirect("/admin/login");
    } else {
      if (adminDetails.password == password) {
        req.session.adminId = adminDetails._id;
        return res
          .status(200)
          .json({ message: "Login successful", userId: adminDetails._id });
      } else {
        req.session.adminCheck = true;
        res.redirect("/admin/login");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const homeGet = async (req, res) => {
  try {
    if (req.session.adminId) {
      res.render("admin/adminHome");
    } else {
      res.redirect("/admin/");
    }
  } catch (error) {
    console.log(error);
  }
};




const categoryLisGet = async (req, res) => {
  try {
    const id = req.query.id;
    console.log("Category ID:", id);
    const data = await categoryModel.findById(id);

    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    const publish = !data.isblock;
    console.log(publish);

    const updatedCategory = await categoryModel.findByIdAndUpdate(id, {
      $set: {
        isblock: publish,
      },
    });

    if (!updatedCategory) {
      return res
        .status(500)
        .json({ status: false, message: "Failed to update category" });
    }

    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const logoutGet = async (req, res) => {
  try {
    console.log("halooooo");
    req.session.adminId = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loginGet,
  loginPost,
  homeGet,
  categoryLisGet,
  logoutGet,
};
