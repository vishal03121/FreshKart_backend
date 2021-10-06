const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const prodcut = new Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true
        },
        prodCatId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        mrp: {
            type: Number,
            required: true
        },
        ourPrice: {
            type: Number,
            required: true
        },
        contents: {
            type: String,
            required: true,
            trim: true
        },
        stock: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        available: {
            type: Boolean,
            required: true
        },
        imageUrl: {
            type: Array,
            required: true
        }
    }
);

module.exports = mongoose.model('product', prodcut);