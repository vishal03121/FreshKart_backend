const { body } = require("express-validator");
const User = require("../models/user");

exports.adminLoginMiddleware = [
    body("email")
      .isEmail()
      .withMessage("Please enter a Valid Email")
      .custom((value, { req }) => {
        return User.findOne(
            { 
                email: value,
                mode:"admin" 
            }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("E-mail address doesn't exists!!!");
          }
        });
      })
      .normalizeEmail(),
    body("password")
    .trim()
    .custom((value, { req }) => {
        if(value.length<8) return Promise.reject("Password must be minimum 8 characters long.");
        return true;
      }),
    body("otp")
    .trim()
    .custom((value, { req }) => {
        if(value.length!=6) return Promise.reject("Invalid OTP");
        return true;
      })
  ];