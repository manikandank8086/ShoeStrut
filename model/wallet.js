const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
  
    totalWallet:{
        type:  Number,
        default : 0
    },
 
     transationId :{
        type: Number
     },
   
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = {Wallet}
