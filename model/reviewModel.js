const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    comment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = { reviewModel };