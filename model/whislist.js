const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const whislitSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

module.exports = mongoose.model('WhislitModel', whislitSchema);