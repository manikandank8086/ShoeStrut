const { render } = require("ejs");
const { User } = require("../model/userModel");
const bcrypt = require("bcrypt");
const varifyOTP = require("../GenarateOTP");
const { sendOtpEmail } = require("../GenarateOTP");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const { cartModel } = require("../model/cartModel");
const { addressModel } = require("../model/addressModel");
const { ObjectId } = require("mongodb");

const cartGet = async (req, res) => {
  try {
    const cartData = await cartModel.findOne({ userId: req.session.userId });
    if (!cartData) {
      res.render("User/cart", { cartData: "" });
    }

    res.render("User/cart", { cartData });
  } catch (error) {
    console.log(error);
  }
};

const cartAdd = async (req, res) => {
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

const qtyUp = async (req, res) => {
  const { action } = req.body;
  let productId = req.params.id;
  console.log("halaaaa", productId);

  try {
    productId = new ObjectId(productId);
    const product = await cartModel.findOne({ "products._id": productId });
    console.log("Product : ",product);
    if (!product) {
      console.log("404");
      return res.status(404).send("Product not found");
    }

    let matchedProduct = product.products.find((p) => p._id.equals(productId));
    const productData = await productPush.findOne({
      _id: matchedProduct.productId,
    });
    console.log("quantity");
    console.log(matchedProduct.quantity);
    console.log("stock");
    console.log(productData.stock);

    if (action === "increment") {
      console.log("inc");
      console.log("qty" + "  " + matchedProduct.quantity);
      console.log("stock" + "  " + productData.stock);

      if (matchedProduct.quantity < 5) {
        console.log('its why worki')
        if (matchedProduct.quantity < productData.stock) {
          matchedProduct.quantity += 1;
          console.log("increment :",matchedProduct.quantity);
          //upadate
          matchedProduct.total = matchedProduct.quantity * matchedProduct.Price;
          //  product.save()
          console.log('matched product')
          console.log(product)

          product.total = calculateTotal(product.products);
          // return res.json({ status: "", quantity: matchedProduct.quantity });
        } else {
          return res
            .status(200)
            .json({ status: "exceeded", quantity: matchedProduct.quantity });
        }
      } else {
        console.log("matchdeproduct.quantity<5");
        return res
          .status(200)
          .json({ status: "minimum", quantity: matchedProduct.quantity });
      }
    } else if (action === "decrement" && matchedProduct.quantity > 1) {
      console.log("dec");
      matchedProduct.quantity -= 1;
      matchedProduct.total = matchedProduct.quantity * matchedProduct.Price;
      product.total = calculateTotal(product.products);
    }
    await product.save();
    console.log('haloooo')
    console.log(matchedProduct)
     res
      .status(200)
      .json({
         matchedProduct,
         product,
        quantity: matchedProduct.quantity,
      });
  } catch (error) {
    console.error(error);
       res.status(500).send("Internal Server Error");
  }
};

const removeDelete = async (req, res) => {
  try {
    const userId = new ObjectId(req.session.userId);
    const productId = new ObjectId(req.params.id);

    const productRemovalResult = await cartModel.updateOne(
      { userId, "products._id": productId },
      { $pull: { products: { _id: productId } } }
    );

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for the user" });
    }
    if (cart && cart.products.length === 0) {
      const cartRemovalResult = await cartModel.deleteOne({ userId });
    }

    return res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkoutGet = async (req, res) => {
  try {
    if (req.session.order) {
      const cartData = await cartModel.findOne({ userId: req.session.userId });

      const userAddress = await addressModel.findOne({
        userId: req.session.userId,
      });

      if (!cartData) {
        return res.status(404).json({ message: "Cart not found for the user" });
      }

      const products = cartData.products;

      products.forEach((Element) => {
        console.log("price is");
        console.log(Element.Price);
      });

      const subtotal = products.reduce(
        (acc, product) => acc + product.total,
        0
      );

      res.render("User/checkout", { products, subtotal, userAddress });
    } else {
      res.redirect("/product/cart");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkVerify = async (req, res) => {
  try {
    req.session.order = true;
    res.redirect("/product/checkout");
  } catch (error) {
    console.log(error);
  }
};

const qtyUpdation = async(req,res) =>{
  let productId = req.params.id;
  console.log("halaaaa", productId);
    productId = new ObjectId(productId);
    const product = await cartModel.findOne({ "products._id": productId });
    console.log("Product : ",product);
    if (!product) {
      console.log("404");
      return res.status(404).send("Product not found");
    }

    let matchedProduct = product.products.find((p) => p._id.equals(productId));
    const productData = await productPush.findOne({
      _id: matchedProduct.productId,
    });
    console.log("quantity");
    console.log(matchedProduct.quantity);
    console.log("stock");
    console.log(productData.stock);

    res.status(200)
      .json({
        quantity: matchedProduct.quantity,
      })

  }
  

const checkoutPost = async (req, res) => {};

module.exports = {
  cartAdd,
  cartGet,
  qtyUp,
  removeDelete,
  checkoutPost,
  checkoutGet,
  checkVerify,
  qtyUpdation
};
