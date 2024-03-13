const { render } = require("ejs");
const { adminModel } = require("../model/adminModel");
const { User } = require("../model/userModel");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const mongoose = require("mongoose");
const session = require("express-session");
const { Order } = require("../model/orderModel");

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
      const latestOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId");

      console.log("deleverd");
      const deliveredOrder = await Order.find({ status: "Delivered" });
      const deliveredRevenue = deliveredOrder.reduce(
        (total, order) =>
          total + parseFloat(order.billTotal.replace("₹", "").replace(",", "")),
        0
      );

      const deliveredOrderCount = await Order.find({
        status: "Delivered",
      }).countDocuments();
      const PendingOrderCount = await Order.find({
        status: "Pending",
      }).countDocuments();
      const productCount = await productPush.find().countDocuments();
      const categoryCount = await categoryModel.find().countDocuments();

      const category = await categoryModel.find();

      const today = new Date();
      const currentMonth = today.getMonth() + 1; 
      const currentYear = today.getFullYear();
      
      const monthlyEarnings = await Order.aggregate([
        {
          $match: {
            status: 'Delivered', 
            $expr: {
              $and: [
                { $eq: [{ $month: '$orderDate' }, currentMonth] },
                { $eq: [{ $year: '$orderDate' }, currentYear] },
              ]
            }
          },
        },
        {
          $unwind: '$items', 
        },
        {
          $addFields: {
            billTotal: { $trim: { input: '$billTotal' } }, 
          },
        },
        {
          $group: {
            _id: {
              month: { $month: '$orderDate' }, 
              year: { $year: '$orderDate' }, 
            },
            totalEarnings: { $sum: { $toDouble: '$billTotal' } }, 
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id.month',
            year: '$_id.year',
            totalEarnings: 1,
          },
        },
        {
          $sort: {
            year: 1,
            month: 1,
          },
        },
      ]);
      
      res.render("admin/adminHome", {
        latestOrders,
        category,
        deliveredRevenue,
        deliveredOrderCount,
        PendingOrderCount,
        productCount,
        categoryCount,
        monthlyEarnings
      });
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
