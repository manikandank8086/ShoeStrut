const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    Email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true
    },
    phoneNumber:{
        type:String,
        require:true
    },
    isblock:{
        type:Boolean,
        default:true
    }
})


  const User = mongoose.model('User',userSchema)
  module.exports ={User}