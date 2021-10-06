const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const order = new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
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
        },
        status:{
            type:String,
            required:true,
            trim:true,
            default:"pending"
        },
        mobile: {
            type: Number,
            required: true
        },
        address: {
            type:String,
            required:true,
            trim: true
        },
        billId:{
            type:String,
            required:true,
            trim:true,
            default: "NULL"
        },
        paymentMode:{
            type:String,
            required:true,
            trim:true,
            default:"POD (Pay On Delivery)"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('order', order);