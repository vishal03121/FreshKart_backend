const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const cart = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true
        },
        userId : {
            type: String,
            required: true,
            trim: true
        },
        orderValue: {
            type: Number,
            required: true,
            default:0
        },
        products: {
            type: Array,
            required: true,
            default:[]
        }
    }
);

module.exports = mongoose.model('cart', cart);