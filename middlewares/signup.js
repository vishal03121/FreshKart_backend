const { body } = require("express-validator");
const User = require("../models/user");

exports.otpMiddleware = [
  body("otp").trim()
  .custom((value, { req }) => {
    if (value.length!=6)
      return Promise.reject("OTP must be of 6 digits");
    return true;
  })
];

exports.signUpMiddleware = [
  body("email")
    .isEmail()
    .withMessage("Please enter a Valid Email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("E-mail address already exists");
        }
      });
    })
    .normalizeEmail(),
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
  body("password")
    .trim()
    .custom((value, { req }) => {
      if (value.length < 8)
        return Promise.reject("Password must be minimum 8 characters long.");
      return true;
    }),
  body("name")
    .trim()
    .custom((value, { req }) => {
      if (value.length == 0)
        return Promise.reject("Name Field Must not be empty");
      return true;
    }),
];
