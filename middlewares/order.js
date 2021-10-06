const { body, query } = require("express-validator");
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const util = require('util')



exports.placeOrderMiddleware = [
  body("userId").custom((value, { req }) => {
      return Cart.findOne({ userId: value }).then((cart) => {
        if (!cart) {
          return Promise.reject("Invalid User");
        } else if (cart.orderValue < 100) {
          return Promise.reject("Minumum Order Value is 100 Rs.");
        } 
  });
}),
  body("mobile")
    .trim()
    .custom((value, { req }) => {
      let phoneno = /^[6-9]{1}\d{9}$/;
      if (value.match(phoneno)) {
        return true;
      } else {
        return Promise.reject("Invalid Phone Number");
      }
    }),
  body("name")
    .trim()
    .custom((value, { req }) => {
      if (value.length == 0)
        return Promise.reject("Name Field Must not be empty");
      return true;
    }),
  body("address")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 30)
        return Promise.reject(
          "Please Give Address with more than 30 Characters"
        );
      return true;
    }),
];

exports.orderStatusMiddleware = [
  query("status")
    .trim()
    .custom((value, { req }) => {
      value = value.toLowerCase();
      if (
        value !== "confirmed" &&
        value !== "shipped" &&
        value !== "delivered" &&
        value !== "rejected" &&
        value !== "pending" &&
        value !== "canceled"
      )
        return Promise.reject("Invalid Status");
      return true;
    }),
];

exports.cancelOrderMiddleware = [
  body("otp")
    .trim()
    .custom((value, { req }) => {
      if (value.length != 6) return Promise.reject("Invalid OTP");
      return true;
    }),
];
