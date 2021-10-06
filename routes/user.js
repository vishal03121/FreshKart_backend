// importing packages
const express = require("express");
const { body } = require("express-validator");

const authUser = require("../middlewares/authUser");
const userController = require("../controllers/user");

const { signUpMiddleware, otpMiddleware } = require("../middlewares/signup");
const { loginMiddleware } = require("../middlewares/login");
const {
  updateProfileNameMiddleware,
  changePasswordMiddleware,
  resendOtpMiddleware,
  forgotPasswordMiddleware
} = require("../middlewares/updateProfile");

const {placeOrderMiddleware, orderStatusMiddleware, cancelOrderMiddleware} = require("../middlewares/order");
const router = express.Router();

//add proper middleware
router.put("/signup", signUpMiddleware, userController.signUp);

router.put(
  "/validateSignUp",
  otpMiddleware,
  userController.validateSignUp
);

router.post("/login", loginMiddleware, userController.login);

router.get("/user/:userId", authUser, userController.getUser);

router.put(
  "/changePassword",
  authUser,
  changePasswordMiddleware,
  userController.changePassword
);

router.put(
  "/updateUserProfile",
  authUser,
  updateProfileNameMiddleware,
  userController.updateUserName
);

router.put(
  "/resendOtp",
  resendOtpMiddleware,
  userController.resendOtp
);

router.get(
  "/resendOtp/:userId",
  authUser,
  userController.resendOtpNoMail
);

router.put(
  "/forgotPassword",
  forgotPasswordMiddleware,
  userController.forgotPassword
);


router.get("/orders", authUser, userController.orders);
router.get("/ordersWithStatus", authUser, orderStatusMiddleware, userController.ordersWithStatus);


router.put("/placeOrder" , authUser, placeOrderMiddleware ,userController.placeOrder);

router.put("/cancelOrder" , authUser, cancelOrderMiddleware ,userController.cancelOrder);

router.get("/viewOrder/:orderId", authUser, userController.viewOrder);

module.exports = router;
