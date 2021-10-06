// importing packages
const express = require("express");
const adminController = require("../controllers/admin");


const {adminLoginMiddleware} = require("../middlewares/admin")
const router = express.Router();


router.post(
  "/login",
  adminLoginMiddleware,
  adminController.adminLogin
);



module.exports = router;
