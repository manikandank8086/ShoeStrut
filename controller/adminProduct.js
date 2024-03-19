const { render } = require("ejs");
const { adminModel } = require("../model/adminModel");
const { User } = require("../model/userModel");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const { Order } = require("../model/orderModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const XLSX = require('xlsx');


const session = require("express-session");
const { Wallet } = require("../model/wallet");

const productGet = async (req, res) => {
  const PAGE_SIZE = 3;
  try {
    console.log(req.query.page);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const startIndex = (page - 1) * limit;

    const totalDocuments = await productPush.countDocuments({});
    const totalPages = Math.ceil(totalDocuments / limit);

    const product = await productPush
      .find()
      .populate("categoryId")
      .skip(startIndex)
      .limit(limit);

    res
      .status(200)
      .render("admin/productList", { product, totalPages, currentPage: page });
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
    let discountPercentage;
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
        OfferPrice
      } = productData;
    
      if (req.file) {
        var image = req.file.filename;
      }
      console.log('offer price is working')

      if(OfferPrice){
        const discountAmount = Price - OfferPrice;
        discountPercentage = (discountAmount / Price) * 100;
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
        offerPrice :OfferPrice,
        image,
        discountPercentage : discountPercentage
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
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    let  discountPercentage

    const productId = req.params.id;
    const { title, description, brand, stock, Price, category,offerPrice } = req.body;

      // Calculate the discount percentage
      if(offerPrice){
    const discountAmount = Price - offerPrice;
    discountPercentage = (discountAmount / Price) * 100;
      }


    let updatedProductData = { title, description, brand, stock, Price, category ,offerPrice,discountPercentage};
    if (req.file) {
      updatedProductData.image = req.file.filename; 
    }

    console.log('updatedProductData', updatedProductData);

    const updatedProduct = await productPush.findOneAndUpdate(
      { _id: productId },
      { $set: updatedProductData },
      { new: true }
    );

    console.log('update Product data', updatedProductData);

    if (!updatedProduct) {
      return res.status(404).render("404page");
    }

    res.redirect("/admin/product/list");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};





const editDeleteImg = async (req, res) => {
  try {
    console.log('working' + req.params.id)
    const id = req.params.id;
    const product = await productPush.findById(id);
    if (product.image) {
      // Handle image deletion (remove file from disk, delete from database, etc.)
    }

    const deletedProduct = await productPush.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    res.status(200).json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: false, message: "Internal Server Error" });
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
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    if (orderData.length > 0) {
      return res.status(200).render("admin/orderList", {
        orderData,
        totalPages,
        currentPage: page,
      });
    } else {
      return res.status(404).redirect("404");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error");
  }
};


const OrderSearch = async (req, res) => {
  try {
    const query = req.query.query;

    // Perform search query
    const orderData = await Order.find({
      $or: [
        { orderId: { $regex: query, $options: "i" } },
        { status: { $regex: query, $options: "i" } },
        { "userId.username": { $regex: query, $options: "i" } },
      ],
    }).populate("userId", "username");

    console.log("Query:", query);
    console.log("Search Results:", orderData);

    res.status(200).json({ status: "success", data: orderData });
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const changeStatus = async (req, res) => {
  try {
    console.log("Working 2");
    let { orderId, newStatus } = req.body;
    console.log(orderId, newStatus);
    let deliveredDate
      if(newStatus === 'Delivered'){
        console.log('deliverd date')
         deliveredDate = new Date()
        console.log(deliveredDate)
        
      }
    console.log("working", newStatus);

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId },
      { status: newStatus,deliveredDate : deliveredDate },
      { new: true }
    );
    console.log(updatedOrder)

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const orderDelete = async (req, res) => {
  try {
    console.log("5433");
    const orderId = req.params.id;
    console.log(orderId);

    const orderData = await Order.find({}).populate("userId", "username");

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).send("Order not found");
    }

    return res.status(200).render("admin/orderList", { orderData });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const OrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderData = await Order.findOne({ orderId: orderId })
      .populate("userId", "city")
      .populate("items.productId");

    const userData = await User.findOne({ _id: orderData.userId });
    res
      .status(200)
      .render("admin/orderDetails", { order: orderData, userData });
  } catch (error) {
    console.log(error);
  }
};


const confirmReturn = async(req,res)=>{
  try{
    console.log('working')
    console.log(req.params.id)
    const orderId = req.params.id
    console.log(orderId)

    const orderData = await Order.findOneAndUpdate(
      { orderId: orderId },
      { $set: { status: 'Return', returnRequest: false, returnStatus: 'Success' } },
      { new: true }
  );
        res.status(200).json({message:'Success'})  
  console.log(orderData)
    

  }catch(error){
    res.status(500).json({error:'Internal Server Error'})
  }
}


const rejectReturn = async(req,res)=>{
  try{
    console.log('working reject')
    const orderId = req.params.id
    console.log(orderId)
   
    const orderData = await Order.findOneAndUpdate(
      {orderId : orderId},
      {$set : {returnStatus : 'Rejected',returnRequest :false}},
      {new : true}
    )
    console.log(orderData)
    res.status(200).json({message:''})

  }catch(error){
    console.log(error)
    res.status(500).json({error:'Internal Server Error'})
  }
}



//wallet 











const salesReport = async (req, res) => {
  try {
    const PAGE_SIZE = 8;
  //pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || PAGE_SIZE;
  const startIndex = (page - 1) * limit;

  const totalDocuments = await Order.find({status:'Delivered'}).countDocuments({});
  const totalPages = Math.ceil(totalDocuments / limit);

  

    const latestOrders = await Order.find({ status: "Delivered" })
      .sort({ _id: -1 })
      .populate("userId")
      .skip(startIndex)
      .limit(limit);

    const deliveredOrderCount = await Order.find({
      status: "Delivered",
    }).countDocuments();

    const deliveredOrder = await Order.find({ status: "Delivered" });
    const deliveredRevenue = deliveredOrder.reduce(
      (total, order) =>
        total + parseFloat(order.billTotal.replace("₹", "").replace(",", "")),
      0
    );

    const discounts = await Order.find({ status: "Delivered" });

    const totalDiscountValue = discounts.reduce((total, order) => {
    
      if (order && typeof order.discountPrice !== 'undefined') {
    
        if (typeof order.discountPrice === 'number') {
          
          return total + order.discountPrice;
        } else if (typeof order.discountPrice === 'string') {
          const discountAmount = parseInt(order.discountPrice);
          
    
          if (!isNaN(discountAmount)) {
            return total + discountAmount;
          }
        }
      }
     
    
      
      return total;
    }, 0);
  
    const totalDiscount = parseInt(totalDiscountValue);

    res
      .status(200)
      .render("admin/salesReport", {
        latestOrders,
        deliveredOrderCount,
        deliveredRevenue,
        totalDiscount,
        totalPages,
        currentPage: page,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const dateSearch = async (req, res) => {
  try {
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server error' });
  }
};


const excelDownload = async (req, res) => {
  const salesDataArray = req.body.salesDataArray;

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert the JSON data to a worksheet
const worksheet = XLSX.utils.json_to_sheet(salesDataArray);

// Adjust column widths dynamically based on content length and header length
const columnWidths = [];
const headerNames = Object.keys(salesDataArray[0]);
for (let i = 0; i < headerNames.length; i++) {
    const col = XLSX.utils.encode_col(i);
    const headerLength = headerNames[i].length;
    const contentLength = salesDataArray.reduce((max, row) => {
        const cellContent = row[headerNames[i]] ? row[headerNames[i]].toString() : '';
        return Math.max(max, cellContent.length);
    }, headerLength);
    const columnWidth = { wch: Math.max(headerLength, contentLength) + 2 }; // Add extra padding for better visibility
    columnWidths.push(columnWidth);
}
worksheet['!cols'] = columnWidths;

// Apply header styles
const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { type: 'pattern', patternType: 'solid', fgColor: { rgb: 'CCCCCC' } }
};
const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
    if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = headerStyle;
    }
}

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

// Convert the workbook to a buffer
const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

// Set headers for the HTTP response
res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
res.setHeader('Content-Type', 'application/octet-stream');

// Send the Excel buffer as the response
res.send(excelBuffer);
}




module.exports = {
  productGet,
  addProductGet,
  productPushPost,
  productListGet,
  productListEditGet,
  editDeleteImg,
  productEditPost,
  userListGet,
  blockUserGet,
  orderList,
  orderDelete,
  changeStatus,
  OrderDetails,
  OrderSearch,
  confirmReturn,
  rejectReturn,
  
  
  //sales report
  salesReport,
  dateSearch,
  excelDownload
  
};
