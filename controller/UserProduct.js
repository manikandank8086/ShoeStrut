const { render } = require("ejs");
const { User } = require("../model/userModel");
const bcrypt = require("bcrypt");
const varifyOTP = require("../GenarateOTP");
const { sendOtpEmail } = require("../GenarateOTP");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const { cartModel } = require("../model/cartModel");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { reviewModel } = require("../model/ReviewModel");

const productDetailsGet = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render("404page");
    }

    //star

    let userRating = await reviewModel.findOne({
      productId: id,
      userId: req.session.userId,
    });
    let userRated = userRating?.rating ? userRating.rating : 0;
    console.log("Rating : ", userRated);

    const product = await productPush.findOne({ _id: id });
    const relatedProducts = await productPush
      .find({})
      .sort({ _id: -1 })
      .limit(4);
  
    if (!product) {
      return res.render("404page");
    }
    
    const reviewData = await reviewModel.find({ productId: id }).populate('userId', 'username');
    
    // reviewData.forEach(review => {
    //     console.log('Username:', review.userId.username); // Access the username of the user who wrote the review
    // });
    const cartData = await cartModel.find({ userId: req.session.userId });


    const reviewCount = reviewModel.length-1
    console.log( 'review count ' + reviewCount)
    

    res.render("User/productDetails", {
      product,
      cartData,
      relatedProducts,
      userRated,
      reviewData,
      reviewCount,
    });
  } catch (error) {
    console.log(error);
  }
};

const Ratings = async (req, res) => {
  try {
    console.log("working");
    let userId = req.session.userId;
    let { comment, productId } = req.body;
    userId = new ObjectId(userId);
    productId = new ObjectId(productId);

    const review = await reviewModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (!review) {
      const newReview = new reviewModel({
        userId: userId,
        productId: productId,
        comment: comment,
      });
      await newReview.save();
      console.log(newReview);
    } else {
      review.comment = comment;
      await review.save();
      console.log(review);
    }

    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const Star = async (req, res) => {
  try {
    let userId = req.session.userId;
    let { rate, productId } = req.body;
    userId = new ObjectId(userId);
    productId = new ObjectId(productId);

    const commentExist = await reviewModel.findOne({
      userId: userId,
      productId: productId,
    });
    
    if (!commentExist) {
      const newComment = new reviewModel({
        productId: productId,
        userId: userId,
        rating: rate,
      });
      await newComment.save();
    } else {
      await reviewModel.updateOne(
        { userId: userId, productId: productId },
        { $set: { rating: rate } }
      );
    }

    const ratings = await productPush.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews"
        }
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" }
        }
      }
    ]);

  
    ratings.forEach(async rating => {
      await productPush.findByIdAndUpdate(rating._id, { $set: { rating: rating.averageRating } });
    });

    
    const productsUpdated = await productPush.find({});
    console.log('working  aaaanu')
    console.log(productsUpdated);

    return res.json({ status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const shopGet = async (req, res) => {
  const PAGE_SIZE = 6;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const startIndex = (page - 1) * limit;

    const totalDocuments = await productPush.countDocuments({});
    const totalPages = Math.ceil(totalDocuments / limit);

    const product = await productPush.find({}).skip(startIndex).limit(limit);
    console.log(product)



     const ratings = await productPush.aggregate([
      {
          $lookup: {
              from: "reviews", 
              localField: "_id",
              foreignField: "productId",
              as: "reviews"
          }
      },
      {
          $addFields: {
              averageRating: { $avg: "$reviews.rating" }
          }
      },
      
  ]);

    const newArrivals = await productPush.find({}).sort({ _id: -1 }).limit(5);

    const categories = await categoryModel.find({});

    res.render("User/shop", {
      product,
      categories,
      newArrivals,
      totalPages,
      currentPage: page,
      ratings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const CategoryFilter = async (req, res) => {
  try {
    const category = req.query.category;

    console.log("working" + category);

    const filteredCategory = await productPush.find({ categoryId: category });

    if (filteredCategory.length == 0) {
      res
        .status(404)
        .json({ error: "Product not found the specified category" });
    } else {
      console.log("oke");
      res.status(200).json(filteredCategory);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const ShopSort = async (req, res) => {
  try {
    const { sortOption } = req.body;

    let sortedProducts;
    if (sortOption === "High to Low") {
      sortedProducts = await productPush.find().sort({ Price: -1 });
      return res.status(200).json(sortedProducts);
    } else if (sortOption === "Low to High") {
      sortedProducts = await productPush.find().sort({ Price: 1 });
      return res.status(200).json(sortedProducts);
    } else if (sortOption === "Ratings") {
      sortedProducts = await productPush.aggregate([
        {
            $lookup: {
                from: "reviews", 
                localField: "_id",
                foreignField: "productId",
                as: "reviews"
            }
        },
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" }
            }
        },
        
    ]);
    console.log(sortedProducts)

    return res.status(200).json(sortedProducts)
    } else if (sortOption === "Featured") {
      console.log("working");
      sortedProducts = await productPush.find({ Price: { $gt: 10000 } });
      return res.status(200).json(sortedProducts);
    } else if (sortOption === "New newArrivals") {
      sortedProducts = await productPush
        .find()
        .sort({ createdAt: -1 })
        .limit(6);
      return res.status(200).json(sortedProducts);
    } else if (sortOption === "aA-zZ") {
      sortedProducts = await productPush.find().sort({ title: 1 });
      return res.status(200).json(sortedProducts);
    } else if (sortOption === "zZ-aA") {
      sortedProducts = await productPush.find().sort({ title: -1 });
      return res.status(200).json(sortedProducts);
    } else {
      console.log("not entered");
      // Handle invalid sort options
      res.status(404).json({ error: "Product not found" });
      return;
    }
  } catch (error) {
    console.log("error");
    console.log(error);
    res.status(500).json("Internal Server side error");
  }
};

const ShopSearch = async (req, res) => {
  try {
    console.log("Working ShopSearch");
    if (!req.body || !req.body.search) {
      return res.status(400).json({ error: "Search query is missing" });
    }

    const searchQuery = req.body.search;
    console.log("Search query:", searchQuery);

    // Check if the search query is a valid number
    const isNumeric = !isNaN(parseFloat(searchQuery)) && isFinite(searchQuery);
    let searchCriteria;
    if (isNumeric) {
      // If search query is a number, perform numeric comparison on Price
      searchCriteria = { Price: parseFloat(searchQuery) };
    } else {
      // If search query is not a number, perform regular expression search on other fields
      searchCriteria = {
        $or: [
          { brand: { $regex: searchQuery, $options: "i" } },
          { title: { $regex: searchQuery, $options: "i" } },
          { type: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const searchResult = await productPush.find(searchCriteria);
    console.log("Search result:", searchResult);

    res.status(200).json(searchResult);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  productDetailsGet,
  Ratings,
  Star,
  shopGet,
  CategoryFilter,
  ShopSort,
  ShopSearch,
};