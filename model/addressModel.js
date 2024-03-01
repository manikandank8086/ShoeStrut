const mongoose=require('mongoose')

const addressSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    Address: [
        {
              type:{
            type:String,
            required:true,
            enum: ['work', 'temp', 'home']
        },
            name:{
                type:String,
                require:true
            },
            phone:{
                type:Number,
                require:true
            },
            pincode:{
                type:Number,
                require:true
            },

            address:{
                type:String,
                require:true
            },


            city:{
                type:String,
                require:true
            },
            landmark:{
                type:String,
            
            },
            state:{
                type:String
            }
        }
    ]
    })

const addressModel=mongoose.model('Address',addressSchema)

module.exports = {addressModel}