const mongoose = require("mongoose");
const categoryScheama = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  isblock: {
    type: Boolean,
    default: true,
  },
  OfferStartDate: {
    // offer side
    type: String,
    default: "false",
  },
  OfferEndDate: {
    type: String,
    default: "false",
  },
  OfferDiscountPrice: {
    type: Number,
    default: 0,
  },
  discount:{
    type:Number,
    default:0
  },
  OfferStartingPrice: {
    type: Number,
    default: 0,
  },
  catOfferStatus: {
    type: String,
    default: "false",
  },
  isActive:{
   type:Boolean,
   default:true
  }
});
const categoryModel = mongoose.model("Category", categoryScheama);
module.exports = { categoryModel };
