const { body, param } = require("express-validator");
const Product = require("../models/product");

exports.checkQty = [
  param("qty")
    .trim()
    .custom((value, { req }) => {
        if (value > 4) return Promise.reject("Quantity Can Not Exceed 4");
        else if (value < 1) return Promise.reject("Quantity Can Not be less than 1");
        return true;
    })
];

exports.adddToCart = [
    body("qty")
    .trim()
    .custom((value, { req }) => {
        if (value > 4) return Promise.reject("Quantity Can Not Exceed 4");
        else if (value < 1) return Promise.reject("Quantity Can Not be less than 1");
        return true;
    })
]