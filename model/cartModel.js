const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            Price: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            total:{
                type:Number,
                require:true
            }
        }
    ],
    total: {
        type: Number,
        required: true,
    },
    discount:{
        type:Number,
        default:0
    }
})



const cartModel=mongoose.model('Cart',cartSchema)

module.exports = {cartModel}