const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectID = mongoose.Schema.Types.ObjectId;

const orderSchema = new Schema({
    userId: {
        type: ObjectID,
        ref: 'User', 
        required: true,
    },
  cart: {
    type: ObjectID,
    ref: 'Cart',
  },
  paymentId : {
    type : String
  },
  orderId:{
    type:String
  },
  items: [
    {
        productId: {
            type: ObjectID,
            ref: 'Product',
            required: true,
        },
      image: {
        type: String,
      },
      name: {
        type: String,
      },
      productPrice: {
        type: String,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less than 1.'],
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  billTotal: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed','Delivered'],
    default: 'Pending',
  },

  deliveryAddress: 
    {
      addressType: {
        type: String,
        required: true,
        enum: ['work', 'temp', 'home']
      },
      Landmark: String,
      pincode: Number,
      city: String,
      State: String,
    }
  ,
  orderDate: {
    type: Date,
    default: Date.now,
  },
  cancellationReason:{
     type:String
  },
  netAmount :{
    type:Number
  },
  discountPrice:{
    type :Number,
    default : 0
  },
  discount :{
    type:Number
  },
  couponCode:{
   type:String,
   default:'No Coupon'
  },
  paymentOption :{
    type:String,
    default : 'Cash On Delivery'
  },
  deliveredDate :{
    type:Date,
    default:Date.now
  },
  status: {
    type: String,
    enum:['Pending','Processing', 'Shipped','Failed', 'Delivered','Canceled','Return','Request'],
    default: 'Pending'
},

// return 

returnRequest : {
  type : Boolean,
  default :false
},
returnReason : {
  type :String,
},
returnStatus: {
  type : String
},
returnDate : {
  type: Date
},

},
{
    timestamps:true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};