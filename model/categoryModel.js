const mongoose=require('mongoose')
const categoryScheama= new mongoose.Schema({
     name:{
        type:String,
        require:true,
     
      
     },

     description:{
        type:String,
        require:true
     },
     isblock:{
      type:Boolean,
      default:true
     }
})
       const categoryModel = mongoose.model('Category',categoryScheama)
module.exports={categoryModel}