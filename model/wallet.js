const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    walletAmount: {
        type: Number,
        default: 0
    },
 
     transationId :{
        type: Number
     },
     transationType:{
        type: String,
        default : 'Pending'
     },
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = {Wallet}
