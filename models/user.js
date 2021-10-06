const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const user = new Schema(
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
        mode: {
            type: String,
            default: "user"
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: Number,
            required: true
        },
        secret: {
            type: Object,
            required: true
        }
    }
);

module.exports = mongoose.model('user', user);