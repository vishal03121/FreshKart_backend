const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const signup = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        temp_secret: {
            type: Object,
            required: true
        }
    }
);

module.exports = mongoose.model('signup', signup);