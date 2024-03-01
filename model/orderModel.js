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
    enum: ['Pending', 'Success', 'Failed'],
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
  status: {
    type: String,
    enum:['Pending','Processing', 'Shipped', 'Delivered','Canceled','Return','Request'],
    default: 'Pending'
},

},
{
    timestamps:true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};