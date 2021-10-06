// importing packages
const express = require("express");

const indexController = require("../controllers/index");

const router = express.Router();








// temporary add product category route
router.post("/postCategories", indexController.postCategories)






module.exports = router;