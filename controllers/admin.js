const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");

const User = require("../models/user");

// exports.adminLogin = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { email, password } = req.body;
//   const token = req.body.otp;
//   try {
//     let loadedUser;
//     User.findOne({ email: email, mode:"admin" })
//       .then((user) => {
//         if (!user) {
//           const error = new Error("E-mail address doesn't exists!!!");
//           error.statusCode = 401;
//           throw error;
//         }
//         loadedUser = user;
//         return bcrypt.compare(password, user.password);
//       })
//       .then((isEqual) => {
//         if (!isEqual) {
//           const error = new Error("Wrong Password");
//           error.statusCode = 401;
//           throw error;
//         }
//         const { base32: secret } = loadedUser.secret;
//         const tokenValidates = speakeasy.totp.verify({
//           secret,
//           encoding: "base32",
//           token,
//           window: 1,
//         });
//         if (tokenValidates) {
//           const jwtToken = jwt.sign(
//             {
//               email: loadedUser.email,
//               usedId: loadedUser._id.toString(),
//             },
//             "Arat3cgfaRnWEfyj95PREzBDgUbmPm",
//             { expiresIn: "1h" }
//           );
//           res.status(200).json({
//             token: jwtToken,
//             userId: loadedUser._id.toString(),
//           });
//         } else {
//           res.status(401).json({
//             message: "Unauthorized",
//           });
//         }
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
exports.adminLogin = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const { email, password } = req.body;
    const token = req.body.otp;
    try{
      let user = await User.findOne({ email: email, mode:"admin" })
      if (!user) {
        const error = new Error("E-mail address doesn't exists!!!");
        error.statusCode = 401;
        throw error;
      }
      let isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error("Wrong Password");
        error.statusCode = 401;
        throw error;
      }
      const { base32: secret } = user.secret;
      const tokenValidates = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 1,
      });
      if (tokenValidates) {
        const jwtToken = jwt.sign(
          {
            email: user.email,
            usedId: user._id.toString(),
          },
          "Arat3cgfaRnWEfyj95PREzBDgUbmPm",
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: jwtToken,
          userId: user._id.toString(),
        });
      } else {
        res.status(401).json({
          message: "Unauthorized",
        });
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