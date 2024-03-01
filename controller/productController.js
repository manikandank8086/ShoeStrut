const { render } = require("ejs");
const { adminModel } = require("../model/adminModel");
const { User } = require("../model/userModel");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const {Order}   = require('../model/orderModel')
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const session = require("express-session");

const productGet = async (req, res) => {
  const PAGE_SIZE = 3;
  try {
    console.log(req.query.page)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || PAGE_SIZE;
      const startIndex = (page - 1) * limit;

      const totalDocuments = await productPush.countDocuments({});
      const totalPages = Math.ceil(totalDocuments / limit);

      const product = await productPush.find().populate("categoryId")
          .skip(startIndex)
          .limit(limit);
      
      res.status(200).render("admin/productList", { product, totalPages, currentPage: page });
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
};

const addProductGet = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    console.log(category);
    res.render("admin/addProduct", { category });
  } catch (error) {
    console.log(error);
  }
};

const productPushPost = async (req, res) => {
  try {
    const productData = req.body;
    console.log(productData);
    console.log(req.file);
    if (productData) {
      const {
        title,
        color,
        size,
        type,
        description,
        brand,
        category,
        Price,
        stock,
        status,
        tag,
      } = productData;
      console.log(category);
      if (req.file) {
        var image = req.file.filename;
      }

      productPush.insertMany({
        title,
        color,
        size,
        type,
        description,
        brand,
        categoryId: category,
        Price,
        stock,
        status,
        tag,
        image,
      });

      res.redirect("/admin/product/add");
    } else {
      res.redirect("/admin/product/add");
    }
  } catch (error) {
    console.log(error);
  }
};

const productListGet = async (req, res) => {
  try {
    const id = req.query.id;
    console.log("product ID:", id);
    const data = await productPush.findById(id);

    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: "Productpage not found" });
    }

    const publish = !data.isblock;
    
    const updatedProduct = await productPush.findByIdAndUpdate(id, {
      $set: {
        isblock: publish,
      },
    });

    if (!updatedProduct) {
      return res
        .status(500)
        .json({ status: false, message: "Failed to update product" });
    }

    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const productListEditGet = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productPush.findOne({ _id: productId });
    if (!product) {
      return res.status(404).render("404page");
    }


    
    res.render("admin/productEdit", { product });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const productEditPost = async (req, res) => {
  try {
    console.log("hgh");
    const productId = req.params.id;
    const { title, description, brand, stock, Price, category } = req.body;

    const updatedProduct = await productPush.findOneAndUpdate(
      { _id: productId },
      { $set: { title, description, brand, stock, Price, category } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).render("404page");
    }

    res.redirect("/admin/product/list");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const productDeleteGEt = async (req, res) => {
  console.log("hii");
  try {
    const id = req.params.id;
    const deleteUser = await User.findByIdAndDelete({ _id: id });
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const userListGet = async (req, res) => {
  try {
    const user = await User.find({});

    res.render("admin/userList", { user });
  } catch (error) {
    console.log(error);
  }
};

const blockUserGet = async (req, res) => {
  console.log(req.query);
  try {
    const id = req.query.id;
    const data = await User.findById(id);
    const publish = data.isblock === false ? true : false;
    const finded = await User.findByIdAndUpdate(id, {
      $set: {
        isblock: publish,
      },
    });

    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error);
  }
};

const orderList = async (req, res) => {
  const PAGE_SIZE = 12;
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || PAGE_SIZE;
      const startIndex = (page - 1) * limit;

      const totalDocuments = await Order.countDocuments({});
      const totalPages = Math.ceil(totalDocuments / limit);

      const orderData = await Order.find({})
          .populate('userId', 'username')
          .skip(startIndex)
          .limit(limit);

      if (orderData.length > 0) {
          return res.status(200).render("admin/orderList", { orderData, totalPages, currentPage: page  });
      } else {
          return res.status(404).redirect('404');
      }
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server error");
  }
};


// const OrderSearch = async(req,res)=>{
//   try{

//     console.log(req.query.key)
    
//        let orderData= await  Order.find({
//          "$or":[
//           {orderId:{$regex:req.params.key}}
//          ]
//        })
//        console.log(orderData)

//   }catch(error){
//     console.log(error)
//     res.status(500).send('Internal server Error')
//   }
// }

// const Order = require('../models/Order'
const OrderSearch = async (req, res) => {
  try {
    const query = req.query.query;

    // Perform search query
    const orderData = await Order.find({
      "$or": [
        { orderId: { $regex: query, $options: 'i' } }, 
        { status: { $regex: query, $options: 'i' } }, 
        { 'userId.username': { $regex: query, $options: 'i' } } 
      ]
    }).populate('userId', 'username');

    console.log("Query:", query);
    console.log("Search Results:", orderData);

    res.status(200).json({ status: 'success', data: orderData });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};




const changeStatus = async (req, res) => {
  try {
      console.log("Working 2");
      let {  orderId, newStatus } = req.body;
      console.log( orderId , newStatus)
      

     
      console.log('working', newStatus);

      const updatedOrder = await Order.findOneAndUpdate(
          { orderId: orderId },
          { status: newStatus },
          { new: true } 
      );

      if (!updatedOrder) {
          return res.status(404).json({ message: "Order not found" });
      }

      return res.json(updatedOrder);
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
  }
};


const orderDelete = async(req,res)=>{

    try {
      console.log('5433')
        const orderId = req.params.id;
        console.log(orderId);

    const orderData= await Order.find({}).populate('userId','username')
        
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).send('Order not found');
        }

        return res.status(200).render('admin/orderList',{orderData})
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const OrderDetails=async(req,res)=>{
  try{
      
    const orderId=req.params.id

    const orderData = await Order.findOne({orderId:orderId}).populate("userId", "city")
    .populate("items.productId");
    console.log(orderData.userId)
    console.log(orderId)
    const userData = await User.findOne({ _id:orderData.userId });
      res.status(200).render('admin/orderDetails',{order:orderData,userData})

  }catch(error){
    console.log(error)
  }
}




module.exports = {
  productGet,
  addProductGet,
  productPushPost,
  productListGet,
  productListEditGet,
  productDeleteGEt,
  productEditPost,
  userListGet,
  blockUserGet,
  orderList,
  orderDelete,
  changeStatus,
  OrderDetails,
  OrderSearch,
};
