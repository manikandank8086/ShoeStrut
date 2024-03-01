const { render } = require("ejs");
const { adminModel } = require("../model/adminModel");
const { User } = require("../model/userModel");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const mongoose = require("mongoose");
const session = require("express-session");




const categoryGet = async (req, res) => {
    try {
      console.log('working')
      console.log(req.session.duplicateCategory)
      let message=''
      if(req.session.duplicateCategory){
        console.log('2')
          message='Cannot  add multiple category'
         req.session.duplicateCategory=null
      }
      
         console.log('dsfd')
      const category = await categoryModel.find({});
      res.render("admin/category", { category,message });
      
      
    } catch (error) {
      console.log('3')
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
      
    
        const updatedCategory = await categoryModel.findOneAndUpdate(
          { _id: categoryId },
          { $set: { name, description } },
          { new: true }
        )
        if (!updatedCategory) {
          return res.status(404).render("404page");
        }
      
     
  
     
  
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const categoryPost = async (req, res) => {
    try {
      const categoryData = req.body;
      console.log(categoryData.name);
      const isExist = await categoryModel.findOne({name:categoryData.name});
      console.log(isExist)
      if(!isExist){
        
        const { name, description } = categoryData;
  
        categoryModel.insertMany({ name, description });
      }else{
          req.session.duplicateCategory=true
          res.redirect('/admin/category')
      }
      
        
        res.redirect("/admin/category");
     
       
      
    } catch (error) {
      console.log(error);
    }
  };

  

  module.exports={categoryGet,categoryListGet,editCategoryGet,categoryEditPost,categoryPost}
