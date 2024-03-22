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

// dash bord

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
            status: "Delivered",
            $expr: {
              $and: [
                { $eq: [{ $month: "$orderDate" }, currentMonth] },
                { $eq: [{ $year: "$orderDate" }, currentYear] },
              ],
            },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            billTotal: { $trim: { input: "$billTotal" } },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$orderDate" },
              year: { $year: "$orderDate" },
            },
            totalEarnings: { $sum: { $toDouble: "$billTotal" } },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
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

      // best selling product

      const bestSellingProducts = await Order.aggregate([
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 8 },
      ]);

      const populatedProducts = await Promise.all(
        bestSellingProducts.map(async (product) => {
          const productDetails = await productPush.findById(product._id[0]);
          if (productDetails) {
            return {
              _id: product._id[0],
              image: productDetails.image,
              title: productDetails.title,
              type: productDetails.type,
              offerPrice: productDetails.offerPrice,
              Price: productDetails.Price,
              brand: productDetails.brand,
              rating: productDetails.rating,
              discountPercentage: productDetails.discountPercentage,
            };
          } else {
            console.log(
              `Product details not found for product ID: ${product._id[0]}`
            );
            res.redirect("/admin/adminHome");
          }
        })
      );

      const bestSellingCategories = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $group: {
            _id: "$product.categoryId",
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      // /top selling brand
      const bestSellingBrand = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $group: {
            _id: "$product.brand",
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      //       const today = moment();
      // const sevenDaysAgo = moment().subtract(7, 'days');
      //     const revenuePerDate = await Orders.aggregate([
      //       {
      //         $match: {
      //           orderStatus: 'Downloaded',
      //           orderDate: { $gte: new Date(sevenDaysAgo), $lte: new Date(today) },
      //         },
      //       },
      //       {
      //         $group: {
      //           _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
      //           totalRevenue: { $sum: '$totalAmount' },
      //         },
      //       },
      //       {
      //         $sort: { _id: 1 },
      //       },
      //     ]);

      //     const dates = revenuePerDate.map((item) => item._id);
      //     const revenueValues = revenuePerDate.map((item) => item.totalRevenue);

      //     return { dates, revenueValues };

      res.render("admin/adminHome", {
        latestOrders,
        category,
        deliveredRevenue,
        deliveredOrderCount,
        PendingOrderCount,
        productCount,
        categoryCount,
        monthlyEarnings,
        populatedProducts,
        bestSellingCategories,
        bestSellingBrand,
      });
    } else {
      res.redirect("/admin/");
    }
  } catch (error) {
    console.log(error);
  }
};

const yearlychart = async (req, res) => {
  try {
    try {
      const startYear = 2019; // Set the start year
      const endYear = 2024; // Set the end year

      const productCountPerYear = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${startYear}-01-01`),
              $lte: new Date(`${endYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $year: "$createdAt" }, // Grouping by year of orderDate
            count: { $sum: { $size: "$items" } }, // Counting the number of gameItems (games ordered)
          },
        },
      ]);

      const productCount = {};
      for (let year = startYear; year <= endYear; year++) {
        productCount[year.toString()] = 0;
      }

      productCountPerYear.forEach((item) => {
        const year = item._id;
        productCount[year.toString()] = item.count;
      });
      console.log("product count" + productCount);
      res.status(200).json({ productCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
};

const monthlyChart = async (req, res) => {
  try {
    const { year } = req.query;
    console.log(year);

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    console.log(startDate);
    console.log(endDate);
    const orderDates = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyOrderCounts = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    orderDates.forEach((monthData) => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthName = monthNames[monthData._id - 1];

      // Populate the monthly order counts
      monthlyOrderCounts[monthName] = monthData.count;
    });
    console.log(monthlyOrderCounts);
    res.status(200).json({ monthlyOrderCounts });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
  yearlychart,
  monthlyChart,
  categoryLisGet,
  logoutGet,
};
