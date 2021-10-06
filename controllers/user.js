const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const User = require("../models/user");
const SignUp = require("../models/signup");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const { sendOTPMail } = require("../middlewares/sendMailOtp");

// exports.signUp = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { email, password, mobile, name } = req.body;

//   const temp_secret = speakeasy.generateSecret();
//   temp_secret.otpauth_url = temp_secret.otpauth_url.replace(
//     "SecretKey",
//     "FreshKart"
//   );
//   let hashpassword;
//   let retOb;
//   bcrypt
//     .hash(password, 12)
//     .then((hashedPw) => {
//       hashpassword = hashedPw;

//       return SignUp.findOne({ email: email });
//     })
//     .then((result) => {
//       if (!result) {
//         const qrPath =
//           "secretKeyCodes/" +
//           Date.now().toString() +
//           email.split(".")[0] +
//           ".png";
//         retOb = new SignUp({
//           email: email,
//           mobile: mobile,
//           password: hashpassword,
//           name: name,
//           temp_secret: temp_secret,
//           secretImageKeyUrl: qrPath,
//         });
//         qrcode.toFile(qrPath, temp_secret.otpauth_url, (err) => {
//           if (err) throw err;
//         });
//       } else {
//         retOb = result;
//         retOb.mobile = mobile;
//         retOb.password = hashpassword;
//         retOb.name = name;
//         retOb.secretImageKeyUrl = result.secretImageKeyUrl;
//       }
//       return retOb.save();
//     })
//     .then((result) => {
//       sendOTPMail(retOb.email, user.secret.otpauth_url);
//       res.status(201).json({
//         message: "OTP Sent",
//         signUpId: result._id,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.signUp = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    
    try{
      const { email, password, mobile, name } = req.body;
      const temp_secret = speakeasy.generateSecret();
      temp_secret.otpauth_url = temp_secret.otpauth_url.replace(
        "SecretKey",
        "FreshKart"
      );
      let hashpassword = await bcrypt.hash(password, 12)
      let retOb = await SignUp.findOne({ email: email });
      if (!retOb) {
        retOb = new SignUp({
          email: email,
          mobile: mobile,
          password: hashpassword,
          name: name,
          temp_secret: temp_secret
        });
      } else {
        retOb.mobile = mobile;
        retOb.password = hashpassword;
        retOb.name = name;
      }
      let result = await retOb.save();
      sendOTPMail(retOb.email, retOb.temp_secret.otpauth_url, retOb.temp_secret.base32);
        res.status(201).json({
          message: "OTP Sent",
          signUpId: result._id,
        });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


// exports.validateSignUp = (req, res, next) => {
//   const { userId, token } = req.body;
//   try {
//     let tempUser;
//     SignUp.findById(userId)
//       .then((user) => {
//         if (!user) {
//           const error = new Error("Invalid Request");
//           error.statusCode = 401;
//           throw error;
//         }
//         tempUser = user;
//         const { base32: secret } = tempUser.temp_secret;
//         const verified = speakeasy.totp.verify({
//           secret,
//           encoding: "base32",
//           token,
//         });
//         return verified;
//       })
//       .then((isVerified) => {
//         if (!isVerified) {
//           const error = new Error("Invalid OTP");
//           error.statusCode = 401;
//           throw error;
//         }
//         const newUser = new User({
//           email: tempUser.email,
//           mobile: tempUser.mobile,
//           password: tempUser.password,
//           name: tempUser.name,
//           secret: tempUser.temp_secret,
//           secretImageKeyUrl: tempUser.secretImageKeyUrl,
//         });
//         return newUser.save();
//       })
//       .then((result) => {
//         const cart = new Cart({
//           userId: result._id,
//           email: result.email,
//         });
//         return cart.save();
//       })
//       .then((result) => {
//         return SignUp.findById(userId);
//       })
//       .then((signup) => {
//         if (!signup) {
//           const error = new Error("Could not find post.");
//           error.statusCode = 404;
//           throw error;
//         }
//         return SignUp.findByIdAndDelete(userId);
//       })
//       .then((result) => {
//         res.status(201).json({
//           message: "Verified",
//           verified: true,
//         });
//       })
//       .catch((err) => {
//         if (!err.statusCode) {
//           err.statusCode = 500;
//         }
//         next(err);
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error Verifying user" });
//   }
// };
exports.validateSignUp = async (req, res, next) => {
  const { userId, token } = req.body;
  try {
    let user = await SignUp.findById(userId)
    if (!user) {
      const error = new Error("Invalid Request");
      error.statusCode = 401;
      throw error;
    }
    const { base32: secret } = user.temp_secret;
    const isVerified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });
    if (!isVerified) {
      const error = new Error("Invalid OTP");
      error.statusCode = 401;
      throw error;
    }
    const newUser = new User({
      email: user.email,
      mobile: user.mobile,
      password: user.password,
      name: user.name,
      secret: user.temp_secret,
      secretImageKeyUrl: user.secretImageKeyUrl,
    });
    let result = await newUser.save();
    let cart = new Cart({
      userId: result._id,
      email: result.email,
    });
    cart = await cart.save();
    let sign = await SignUp.findById(userId);
    if (!sign) {
      const error = new Error("Could not find User.");
      error.statusCode = 404;
      throw error;
    }
    await SignUp.findByIdAndDelete(userId);
    res.status(201).json({
      message: "Verified",
      verified: true,
    });
  } 
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.login = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { email, password } = req.body;

//   let loadedUser, token;
//   User.findOne({ email: email, mode: "user" })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("E-mail address doesn't exists!!!");
//         error.statusCode = 401;
//         throw error;
//       }
//       loadedUser = user;
//       return bcrypt.compare(password, user.password);
//     })
//     .then((isEqual) => {
//       if (!isEqual) {
//         const error = new Error("Wrong Password");
//         error.statusCode = 401;
//         throw error;
//       }
//       token = jwt.sign(
//         {
//           email: loadedUser.email,
//           usedId: loadedUser._id.toString(),
//         },
//         "Arat3cgfaRnWEfyj95PREzBDgUbmPm",
//         { expiresIn: "1h" }
//       );
//       return Cart.findOne({ userId: loadedUser._id.toString() });
//     })
//     .then((cart) => {
//       if (!cart) {
//         const error = new Error("Cart Not Found");
//         error.statusCode = 404;
//         throw error;
//       }
//       res.status(200).json({
//         token: token,
//         userId: loadedUser._id.toString(),
//         cart: {
//           orderValue: cart.orderValue,
//           products: cart.products,
//         },
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    try{
      const { email, password } = req.body;

      let user = await User.findOne({ email: email, mode: "user" })
      if (!user) {
        const error = new Error("E-mail address doesn't exists!!!");
        error.statusCode = 401;
        throw error;
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error("Wrong Password");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: user.email,
          usedId: user._id.toString(),
        },
        "Arat3cgfaRnWEfyj95PREzBDgUbmPm",
        { expiresIn: "1h" }
      );

      const cart = await Cart.findOne({ userId: user._id.toString() });
      if (!cart) {
        const error = new Error("Cart Not Found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        token: token,
        userId: user._id.toString(),
        cart: {
          orderValue: cart.orderValue,
          products: cart.products,
        },
      });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }

  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.getUser = (req, res, next) => {
//   const userId = req.params.userId;
//   User.findById(userId)
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       res.status(200).json({
//         name: user.name,
//         email: user.email,
//         mobile: user.mobile,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.getUser = async(req, res, next) => {
  const userId = req.params.userId;
  try{
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Invalid User");
      error.statusCode = 401;
      throw error;
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    });
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.updateUserName = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { userId, name, mobile } = req.body;
//   User.findById(userId)
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       user.name = name;
//       user.mobile = mobile;
//       return user.save();
//     })
//     .then((result) => {
//       res.status(201).json({
//         message: "Profile Updated Successfully!!!",
//         name: result.name,
//         mobile: result.mobile,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.updateUserName = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error();

      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }

    try {
      const { userId, name, mobile } = req.body;
      let user = await User.findById(userId);
      if (!user) {
        const error = new Error("Invalid User");
        error.statusCode = 401;
        throw error;
      }
      user.name = name;
      user.mobile = mobile;
      res.status(201).json({
        message: "Profile Updated Successfully!!!",
        name: user.name,
        mobile: user.mobile,
      });
      user = await user.save();
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.changePassword = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { userId, oldPassword, newPassword } = req.body;
//   let loadedUser;
//   User.findById(userId)
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       loadedUser = user;
//       return bcrypt.compare(oldPassword, user.password);
//     })
//     .then((isEqual) => {
//       if (!isEqual) {
//         const error = new Error("Wrong Old Password");
//         error.statusCode = 401;
//         throw error;
//       }
//       return bcrypt.hash(newPassword, 12);
//     })
//     .then((hashedPw) => {
//       loadedUser.password = hashedPw;
//       return loadedUser.save();
//     })
//     .then((result) => {
//       res.status(201).json({ message: "Password Changed Successfully" });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    try{
      const { userId, oldPassword, newPassword } = req.body;
  let user = await User.findById(userId)
      if (!user) {
        const error = new Error("Invalid User");
        error.statusCode = 401;
        throw error;
      }
      const isEqual = await bcrypt.compare(oldPassword, user.password);
      if (!isEqual) {
        const error = new Error("Wrong Old Password");
        error.statusCode = 401;
        throw error;
      }
      const hashedPw = await bcrypt.hash(newPassword, 12);
      user.password = hashedPw;
      user = await user.save();
      res.status(201).json({ message: "Password Changed Successfully" });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.resendOtp = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }

//   const email = req.body.email;
//   User.findOne({ email: email })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       sendOTPMail(user.email, user.secret.otpauth_url);
//       res.status(200).json({ message: "OTP Sent Successfully" });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.resendOtp = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error();

      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    try {
      const email = req.body.email;
      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("Invalid User");
        error.statusCode = 401;
        throw error;
      }
      sendOTPMail(user.email, user.secret.otpauth_url, user.secret.base32);
      res.status(200).json({ message: "OTP Sent Successfully" });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


// exports.resendOtpNoMail = (req, res, next) => {
//   const userId = req.params.userId;
//   User.findById(userId)
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       sendOTPMail(user.email, user.secret.otpauth_url);
//       res.status(200).json({ message: "OTP Sent Successfully" });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.resendOtpNoMail = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Invalid User");
      error.statusCode = 401;
      throw error;
    }
    sendOTPMail(user.email, user.secret.otpauth_url, user.secret.base32);
    res.status(200).json({ message: "OTP Sent Successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};



// exports.forgotPassword = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { email, newPassword } = req.body;
//   const token = req.body.otp;
//   let loadedUser;
//   User.findOne({ email: email })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       loadedUser = user;
//       const { base32: secret } = loadedUser.secret;
//       const verified = speakeasy.totp.verify({
//         secret,
//         encoding: "base32",
//         token,
//       });
//       return verified;
//     })
//     .then((isVerified) => {
//       if (!isVerified) {
//         const error = new Error("Invalid OTP");
//         error.statusCode = 401;
//         throw error;
//       }
//       return bcrypt.hash(newPassword, 12);
//     })
//     .then((hashedPw) => {
//       loadedUser.password = hashedPw;
//       return loadedUser.save();
//     })
//     .then((result) => {
//       res.status(201).json({ message: "Password Changed Successfully" });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    try{
      const { email, newPassword } = req.body;
      const token = req.body.otp;
      let user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("Invalid User");
        error.statusCode = 401;
        throw error;
      }
      const { base32: secret } = user.secret;
      const isVerified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
      });
      if (!isVerified) {
        const error = new Error("Invalid OTP");
        error.statusCode = 401;
        throw error;
      }
      const hashedPw = await bcrypt.hash(newPassword, 12);
      user.password = hashedPw;
      user = await user.save();
      res.status(201).json({ message: "Password Changed Successfully" });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.orders = (req, res, next) => {
//   const userId = req.query.userId;

//   Order.find({ userId: userId })
//     .then((orders) => {
//       orders.sort(function (a, b) {
//         return new Date(b.updatedAt) - new Date(a.updatedAt);
//       });
//       res.status(200).json({
//         message: "Orders fetched.",
//         orders: orders,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.orders = async (req, res, next) => {
  const userId = req.query.userId;
  try{
    const orders = await Order.find({ userId: userId })
    orders.sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    res.status(200).json({
      message: "Orders fetched.",
      orders: orders,
    });
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


// exports.ordersWithStatus = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const userId = req.query.userId;
//   const status = req.query.status.toLowerCase();

//   Order.find({ userId: userId, status: status })
//     .then((orders) => {
//       orders.sort(function (a, b) {
//         return new Date(b.updatedAt) - new Date(a.updatedAt);
//       });
//       res.status(200).json({
//         message: "Orders fetched.",
//         orders: orders,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.ordersWithStatus = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const userId = req.query.userId;
    const status = req.query.status.toLowerCase();
    try{
      const orders = await Order.find({ userId: userId, status: status })
      orders.sort(function (a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      res.status(200).json({
        message: "Orders fetched.",
        orders: orders,
      });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const updateProductStocks = (products) => {
  products.forEach((prod) => {
    Product.findById(prod.productId)
      .then((result) => {
        result.stock -= prod.qty;
        if (result.stock == 0) {
          result.available = false;
        }
        return result.save();
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
      });
  });
};

//-------------------------------bug---------------------------------//
const checkProducts = async (products) => {
  let res = {
    response: true,
  };
  for (let i = 0; i < products.length; i++) {
    try {
      const product =  await Product.findById(products[i].productId);
      if (product.stock < products[i].qty) {
        res = {
          prodName: product.name,
          response: false,
        };
        return res;
      }
      else if(i==products.length-1){
        return res;
      }
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return err;
    }
  }
};

// exports.placeOrder = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { userId, mobile, address, name } = req.body;
//   let findCart;
//   const addressPart2 = " ,Moga-142001, Punjab, India";
//   let cart = await Cart.findOne({userId:userId}).then().catch((err) => {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   });
//   console.log(cart);
//   let ret
//   try{
//     ret = checkProducts(cart.products).then((result)=>console.log(result))
//   }
//   catch(err){
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   }
//   console.log(ret);
//   if(ret.response){
//     Cart.findOne({ userId: userId })
//       .then((cart) => {
//         if (!cart) {
//           const error = new Error("Invalid User");
//           error.statusCode = 401;
//           throw error;
//         }
//         let newOrder = new Order({
//           userId: userId,
//           name: name,
//           mobile: mobile,
//           address: address + addressPart2,
//           orderValue: cart.orderValue,
//           products: cart.products,
//         });
//         updateProductStocks(cart.products);
//         cart.orderValue = 0;
//         cart.products = [];
//         cart.markModified("products");
//         findCart = cart;
//         return newOrder.save();
//       })
//       .then((result) => {
//         res.status(201).json({ message: "Order Placed Successfully" });
//         return findCart.save();
//       })
//       .catch((err) => {
//         if (!err.statusCode) {
//           err.statusCode = 500;
//         }
//         next(err);
//       });
//   }
//   else{
//     console.log("2");
//     res.status(422).json({ message: ret.prodName + " Not Available with selected Quantity" });
//   }
//   console.log("1");

// };
exports.placeOrder = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const { userId, mobile, address, name } = req.body;
    const addressPart2 = " ,Moga-142001, Punjab, India";
    try{
      let cart = await Cart.findOne({userId:userId})
      if (!cart) {
        const error = new Error("Cart Not Found.");
        error.statusCode = 404;
        throw error;
      }
      let ret = await checkProducts(cart.products);
      if(ret.response){
        let newOrder = new Order({
          userId: userId,
          name: name,
          mobile: mobile,
          address: address + addressPart2,
          orderValue: cart.orderValue,
          products: cart.products,
        });
        cart.orderValue = 0;
        updateProductStocks(cart.products);
        cart.products = [];
        cart.markModified("products");
        const order = await newOrder.save();
        res.status(201).json({ message: "Order Placed Successfully" });
        cart = await cart.save();
        }
        else{
          res.status(401).json({message :ret.prodName + " Not Available with selected Quantity"})
        }
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
//-------------------------------bug---------------------------------//


const updateProductStocksCancel = (products) => {
  products.forEach((prod) => {
    Product.findById(prod.productId)
      .then((result) => {
        result.stock += prod.qty;
        if (result.stock > 0) {
          result.available = true;
        }
        return result.save();
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
      });
  });
};
// exports.cancelOrder = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   let cancelOrder;
//   const orderId = req.body.orderId;
//   const token = req.body.otp;
//   Order.findById(orderId)
//     .then((order) => {
//       if (!order) {
//         const error = new Error("Invalid Order");
//         error.statusCode = 401;
//         throw error;
//       }
//       if (
//         order.status.toLowerCase() !== "pending" &&
//         order.status.toLowerCase() !== "confirmed"
//       ) {
//         const error = new Error("Order Not aligable for Cancelation");
//         error.statusCode = 401;
//         throw error;
//       }
//       cancelOrder = order;
//       return User.findById(order.userId);
//     })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid User");
//         error.statusCode = 401;
//         throw error;
//       }
//       const { base32: secret } = user.secret;
//       const verified = speakeasy.totp.verify({
//         secret,
//         encoding: "base32",
//         token,
//       });
//       return verified;
//     })
//     .then((isVerified) => {
//       if (!isVerified) {
//         const error = new Error("Invalid OTP");
//         error.statusCode = 401;
//         throw error;
//       }
//       updateProductStocksCancel(cancelOrder.products);
//       cancelOrder.status = "canceled";
//       return cancelOrder.save();
//     })
//     .then((result) => {
//       res.status(201).json({ message: "Order Canceled Successfully!!!" });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.cancelOrder = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const orderId = req.body.orderId;
    const token = req.body.otp;
    try{
      let order = await Order.findById(orderId)
      if (!order) {
        const error = new Error("Invalid Order");
        error.statusCode = 401;
        throw error;
      }
      if (
        order.status.toLowerCase() !== "pending" &&
        order.status.toLowerCase() !== "confirmed"
      ) {
        const error = new Error("Order Not aligable for Cancelation");
        error.statusCode = 401;
        throw error;
      }
      const user = await User.findById(order.userId);
      if (!user) {
        const error = new Error("Invalid User");
        error.statusCode = 401;
        throw error;
      }
      const { base32: secret } = user.secret;
      const isVerified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
      });
      if (!isVerified) {
        const error = new Error("Invalid OTP");
        error.statusCode = 401;
        throw error;
      }
      updateProductStocksCancel(order.products);
      order.status = "canceled";
      order = await order.save();
      res.status(201).json({ message: "Order Canceled Successfully!!!" });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};



// exports.viewOrder = (req, res, next) => {
//   const orderId = req.params.orderId;
//   Order.findById(orderId)
//     .then((order) => {
//       if (!order) {
//         const error = new Error("Invalid Order");
//         error.statusCode = 401;
//         throw error;
//       }
//       res
//         .status(200)
//         .json({ message: "Order Fetched", order: order})
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.viewOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  try{
    const order = await Order.findById(orderId)
    if (!order) {
      const error = new Error("Invalid Order");
      error.statusCode = 401;
      throw error;
    }
    res
      .status(200)
      .json({ message: "Order Fetched", order: order})
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

