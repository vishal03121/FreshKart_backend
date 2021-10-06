// importing packages
const express = require("express");


const authUser = require("../middlewares/authUser");
const productController = require("../controllers/product");
const {checkQty, adddToCart} = require("../middlewares/product");
const router = express.Router();





// to get all categories
router.get("/productCategories", productController.getProductCategories);
// to get all products related to categories
router.get("/products/:prodCatId", productController.getProducts);
router.get("/products", productController.getSearchProducts);
router.get("/product/:prodId", productController.getProduct);

//------------pending-----------------------
// router.get("/product/:prodCatId/:qty", productController.getCheckAddToCart)

// temporay add product route ------------disabled----------------
router.post("/add-product", authUser, productController.postProduct);


router.get("/checkProduct/:prodId/:qty", checkQty, productController.checkProduct);

router.put("/addProductToCart", authUser ,adddToCart, productController.addProductToCart);
router.put("/removeFromCart", authUser, productController.removeFromCart);




module.exports = router;