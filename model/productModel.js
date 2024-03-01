const mongoose=require('mongoose')
const category =require('../model/categoryModel')

const productSchema= new  mongoose.Schema({
       title:{
        type:String,
        require:true
       },

       color:{
        type:String,
        require:true
       },

       size:{
        type:Number,
        require:true
       },

       type:{
        type:String,
        require:true
       },

      brand:{
        type:String,
        require:true
      },

       description:{
      type:String,
      require:true
      },

      Price:{
        type:Number,
        require:true
      },
      stock:{
          type:Number,
          require:true
      },
      quantity:{
        type:String,
        require:true
      },

      status:{
        type:Boolean,
        
      },

      tag:{
        type:String,
        require:true
      },
      image:{
        type:String,
        require:true
      },
      categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
      },
      rating:{
        type:Number,
        default:4
      },
      isblock:{
        type:Boolean,
        default:true
       
      } 
    },{
        timestamps: true 
    });
    

  const productPush=mongoose.model('Product',productSchema)

  module.exports ={productPush}