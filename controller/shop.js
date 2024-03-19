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
const { signupGet } = require("./user");
const { Order } = require("../model/orderModel");
const WhislitModel = require("../model/whislist");

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

    const reviewData = await reviewModel
      .find({ productId: id })
      .populate("userId", "username");

    //finding user have ordered product

    const orderedProduct = await Order.findOne({
      userId: req.session.userId,
      "items.productId": id,
    });
    console.log("product ind");
    console.log(orderedProduct);

    const cartData = await cartModel.find({ userId: req.session.userId });
    const userId = req.session.userId

    const reviewCount = reviewModel.length - 1;
    console.log("review count " + reviewCount);

    res.render("User/productDetails", {
      product,
      cartData,
      relatedProducts,
      userRated,
      reviewData,
      reviewCount,
      orderedProduct,
      userId
      
    });
  } catch (error) {
    console.log(error);
  }
};

// const sizeAdd = async (req, res) => {
//   try {
//       const size = req.query.size;
//       const productId = req.query.productId;
//       console.log('working')

//       // Find the product by its ID and update its size attribute
//       const updatedProduct = await productPush.findByIdAndUpdate(
//           {_id:productId}, // Filter by product ID
//           { size: size }, // Set the size field to the new value
//           { new: true } // Return the updated document
//       );

//       console.log('perfect working')

//       console.log(updatedProduct)

//       if (!updatedProduct) {
//         console.log('not working')
//           return res.status(404).json( "Product not found" );
//       }

//       console.log(updatedProduct);
//       return res.json(updatedProduct);
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//   }
// }

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
    } else {
      review.comment = comment;
      await review.save();
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
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
    ]);

    ratings.forEach(async (rating) => {
      await productPush.findByIdAndUpdate(rating._id, {
        $set: { rating: rating.averageRating },
      });
    });

    const productsUpdated = await productPush.find({});
    console.log("working  aaaanu");
    console.log(productsUpdated);

    return res.json({ status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const editReview = async(req,res)=>{
  try {
    const userId = req.session.userId; // Assuming you have a session with userId
    console.log(req.body)
    const  data =req.body.data.review
    const reviewId = req.body.reviewId
    console.log(data,reviewId)

    const updatedReview = await reviewModel.findOneAndUpdate(
        { _id : reviewId },
        { comment: data },
        { new: true }
    );
    console.log(updatedReview)

    if (!updatedReview) {
        return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(200).json({ updatedComment: updatedReview.comment });
} catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ error: 'Internal server error' });
}
}



const deleteReview = async(req,res)=>{
  try {
    console.log('working');
    const reviewId = req.params.id;
    console.log(reviewId);
    const result = await reviewModel.deleteOne({ _id: reviewId });
  
    if (result.deletedCount === 1) {
      console.log('sucess')
      return res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}








const shopGet = async (req, res) => {
  const PAGE_SIZE = 6;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const startIndex = (page - 1) * limit;

    const totalDocuments = await productPush.countDocuments({});
    const totalPages = Math.ceil(totalDocuments / limit);

    const product = await productPush.find({}).skip(startIndex).limit(limit);
    console.log(product);

    const ratings = await productPush.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
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
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: { $avg: "$reviews.rating" },
          },
        },
      ]);
      console.log(sortedProducts);

      return res.status(200).json(sortedProducts);
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

    const isNumeric = !isNaN(parseFloat(searchQuery)) && isFinite(searchQuery);
    let searchCriteria;
    let searchResult;

    if (isNumeric) {
      searchCriteria = { Price: parseFloat(searchQuery) };
    } else {
      searchCriteria = {
        $or: [
          { brand: { $regex: searchQuery, $options: "i" } },
          { title: { $regex: searchQuery, $options: "i" } },
          { type: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    searchResult = await productPush.find(searchCriteria);

    if (searchResult.length === 0) {
      console.log("Searching categories");
      searchCriteria = { name: { $regex: searchQuery, $options: "i" } };

      const categories = await categoryModel.find(searchCriteria);

      if (categories.length > 0) {
        const categoryIds = categories.map((category) => category._id);

        searchResult = await productPush.find({
          categoryId: { $in: categoryIds },
        });
        console.log("Products found in categories:", searchResult);
      }
    }

    // Return the search result
    res.status(200).json(searchResult);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json("Internal Server Error");
  }
};

//whislist
const whislistGet = async (req, res) => {
  try {
    const userId = req.session.userId;

    const wishlist = await WhislitModel.findOne({ userId });

    if (!wishlist) {
      console.log("no wishlist");
      return res
        .status(200)
        .render("User/whislist", {
          products: [],
          message: "User have no wishlist product",
        });
    }

    const productIds = wishlist.products;
    console.log("products");
    console.log(productIds);
    const products = await productPush.find({ _id: { $in: productIds } });
    console.log("products");
    console.log(products);

    res.status(200).render("User/whislist", { products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addWhislist = async (req, res) => {
  try {
    console.log("its working");
    const userId = req.session.userId;
    const productId = req.params.id;

    console.log(userId);
    console.log(productId);

    let wishlist = await WhislitModel.findOne({ userId });
    console.log("whislist");
    console.log(wishlist);

    if (!wishlist) {
      console.log("didt have whislist");
      wishlist = new WhislitModel({ userId, products: [] });
    }

    if (wishlist.products.includes(productId)) {
      console.log("whislist included");
      return res.status(200).json({ status: "included" });
    }

    wishlist.products.push(productId);

    await wishlist.save();

    res
      .status(200)
      .json({ message: "Product added to the wishlist successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addToCartWislist = async (req, res) => {
  console.log("addTo Wishlist is working");
  try {
    const productId = req.params.id;
    const product = await productPush.findOne({ _id: productId });
    if (product) {
      const { title, Price, image } = product;
      const userId = req.session.userId;
      const existingCart = await cartModel.findOne({ userId: userId });
      if (existingCart) {
        const existingProductIndex = existingCart.products.findIndex(
          (item) => item.productId.toString() === productId
        );
        if (existingProductIndex !== -1) {
          existingCart.products[existingProductIndex].quantity++;
          existingCart.products[existingProductIndex].total *=
            existingCart.products[existingProductIndex].quantity;
        } else {
          existingCart.products.push({
            productId: productId,
            title: title,
            Price: Price,
            image: image,
            quantity: 1,
            total: Price,
          });
        }
        existingCart.total = calculateTotal(existingCart.products);
        await existingCart.save();
      } else {
        await cartModel.create({
          userId: userId,
          products: [
            {
              productId: productId,
              title: title,
              Price: Price,
              image: image,
              quantity: 1,
              total: Price,
            },
          ],
          total: Price,
        });
      }

      res.status(200).redirect("/home");
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
const calculateTotal = (products) => {
  return products
    .reduce(
      (total, product) =>
        total + parseFloat(product.Price) * parseInt(product.quantity),
      0
    )
    .toFixed(2);
};

const removeWishlist = async (req, res) => {
  console.log("fffff");
  try {
    console.log("working");
    const userId = req.session.userId;
    const productId = req.params.id;

    const productRemovalResult = await WhislitModel.updateOne(
      { userId },
      { $pull: { products: productId } }
    );

    if (productRemovalResult.nModified === 0) {
      return res
        .status(404)
        .json({ message: "Product not found in the wishlist" });
    }

    const wishlist = await WhislitModel.findOne({ userId });

    if (wishlist && wishlist.products.length === 0) {
      const wishlistRemovalResult = await WhislitModel.deleteOne({ userId });
    }

    return res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  productDetailsGet,
  Ratings,
  Star,
  editReview,
  deleteReview,
  shopGet,
  CategoryFilter,
  ShopSort,
  ShopSearch,
  whislistGet,
  addWhislist,
  addToCartWislist,
  removeWishlist,
};
