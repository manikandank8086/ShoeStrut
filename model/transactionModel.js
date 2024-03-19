const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionType: {
        type: String,
        enum: ['Credit', 'Debit'],
        required: true
    },
    transationId : {
        type:Number
    },
    amount: {
        type: Number,
        required: true
    },
    
   
},{ timestamps: true });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

module.exports = { WalletTransaction }
