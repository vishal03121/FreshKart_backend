const { body } = require("express-validator");
const User = require("../models/user");

exports.updateProfileNameMiddleware = [
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
      if (value.length == 0) {
        return Promise.reject("Name Field Must not be empty");
      }
      return true;
    }),
];

exports.changePasswordMiddleware = [
  body("oldPassword")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 8) return Promise.reject("Old Password must be minimum 8 characters long.");
      return true;
    }),
  body("newPassword")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 8)
        return Promise.reject("New Password must be minimum 8 characters long.");
      return true;
    })
];

exports.resendOtpMiddleware = [
  body("email")
    .isEmail()
    .withMessage("Please enter a Valid Email")
    .normalizeEmail(),
];

exports.forgotPasswordMiddleware = [
  body("email")
    .isEmail()
    .withMessage("Please enter a Valid Email")
    .normalizeEmail(),
  body("newPassword")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 8)
        return Promise.reject("New Password must be minimum 8 characters long.");
      return true;
    }),
  body("otp")
    .trim()
    .custom((value, { req }) => {
      if (value.length != 6)
         return Promise.reject("OTP must be of 6 digits");
      return true;
    }),
];
