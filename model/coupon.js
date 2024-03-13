const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    require: true,
    unique: true
  },
  name:{
    type:String
  },
  discount: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  minimum:{
    type:Number,
  },
  maximum:{
    type:Number
  },
  status:{
    type:String,
  },
  isActive:{
    type:Boolean
  },

});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Coupon };