const { render } = require("ejs");
const { adminModel } = require("../model/adminModel");
const { User } = require("../model/userModel");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const mongoose = require("mongoose");
const session = require("express-session");
const { findOne } = require("../model/whislist");

const categoryGet = async (req, res) => {
  try {
    console.log("working");
    console.log(req.session.duplicateCategory);
    let message = "";
    if (req.session.duplicateCategory) {
      console.log("2");
      message = "Cannot add multiple  category";
      req.session.duplicateCategory = null;
    }

    console.log("dsfd");
    const category = await categoryModel.find({});
    res.render("admin/category", { category, message });
  } catch (error) {
    console.log("3");
    console.log(error);
  }
};

const categoryListGet = async (req, res) => {
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

const editCategoryGet = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.findOne({ _id: categoryId });
    if (!category) {
      return res.status(404).render("404page");
    }

    res.render("admin/adminCategoryEdit", { category });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const categoryEditPost = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    console.log(req.body);
    console.log(name);

    const categoryName = await categoryModel.findOne({ name: name });

    if (!categoryName) {
      const updatedCategory = await categoryModel.findOneAndUpdate(
        { _id: categoryId },
        { $set: { name, description } },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).render("404page");
      }
    }

    return res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const categoryPost = async (req, res) => {
  try {
    const categoryData = req.body;
    console.log(categoryData.name);
    const isExist = await categoryModel.findOne({ name: categoryData.name });
    console.log(isExist);
    if (!isExist) {
      const { name, description } = categoryData;

      categoryModel.insertMany({ name, description });
    } else {
      req.session.duplicateCategory = true;
      res.redirect("/admin/category");
    }

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
  }
};

const OfferListGet = async (req, res) => {
  try {
    const offerList = await categoryModel.find({});

    res.status(200).render("admin/categoryOffer", { offerList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createOffer = async (req, res) => {
  try {
    console.log("workingdsfsfs");
    const categoryId = req.params.id;
    console.log(categoryId);
    const categoryName = await categoryModel.findOne({ _id: categoryId });
    console.log(categoryName);
    res.status(200).render("admin/categoryEditOffer", { categoryName });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editPatch = async (req, res) => {
  try {
    console.log("patch working");
    console.log(req.body)
    const {
      name,
      currentDate,
      startingDate,
      endingDate,
      minimumAmount,
      discountamount,
    } = req.body;

   let status
   
    console.log('working')
      
    console.log(currentDate)
    if(currentDate <startingDate){
       status = 'Coming'
    }else if(currentDate>startingDate  && currentDate <endingDate){
           status = 'Active'
    }else{
      status='Expire'
    }


    const percentageDiscount = parseInt((discountamount / minimumAmount) * 100);

    console.log('percentage' + percentageDiscount)


    
    const updatedData = await categoryModel.findOneAndUpdate(
      { name: name },
      {
        currentDate: currentDate,
        OfferStartDate: startingDate,
        OfferEndDate: endingDate,
        minimumAmount: minimumAmount,
        OfferDiscountPrice: discountamount,
        OfferStartingPrice:minimumAmount,
        isActive :true,
        catOfferStatus: status,
        discount :percentageDiscount

      },
      { new: true } 
    );
    console.log('after ')
    console.log(updatedData)

    const updateProductData = await productPush.findOneAndUpdate(
      {categoryId :updatedData._id},
       {offerPrice : discountamount,
       discountPercentage : percentageDiscount
       },
       {new : true}
    );
    console.log(updateProductData)
     
    
    
     console.log('oke')
     res.status(200).json({status:'success'})
    
      
  } catch (error) {
    
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  categoryGet,
  categoryListGet,
  editCategoryGet,
  categoryEditPost,
  categoryPost,
  OfferListGet,
  createOffer,
  editPatch,
};
