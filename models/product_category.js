const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const prodcutCategorySchema = new Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true
        }
    }
);

module.exports = mongoose.model('product_category', prodcutCategorySchema);