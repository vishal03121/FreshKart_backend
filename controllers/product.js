const product = require("../models/product");
const Cart = require("../models/cart");
const product_category = require("../models/product_category");
const { validationResult } = require("express-validator");

// exports.getProductCategories = (req, res, next) => {
//   product_category
//     .find()
//     .then((productCategories) => {
//       res.status(200).json({
//         message: "Product Categories Fetched.",
//         categories: productCategories,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.getProductCategories = async (req, res, next) => {
  try{
    let productCategories = await product_category.find()
    res.status(200).json({
      message: "Product Categories Fetched.",
      categories: productCategories,
    });
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.getProducts = (req, res, next) => {
//   const prodCatId = req.params.prodCatId;
//   const currentPage = req.query.page || 1;
//   const perPage = 6;
//   let totalItems;

//   product
//     .find({
//       prodCatId: prodCatId,
//       available: true
//     })
//     .countDocuments()
//     .then((count) => {
//       totalItems = count;
//       return product
//         .find({
//           prodCatId: prodCatId,
//           available:true
//         })
//         .skip((currentPage - 1) * perPage)
//         .limit(perPage);
//     })
//     .then((products) => {
//       let retProducts = [];
//       products.forEach((prod) => {
//         retProducts.push({
//           _id: prod._id,
//           name: prod.name,
//           mrp: prod.mrp,
//           ourPrice: prod.ourPrice,
//           contents: prod.contents,
//           description: prod.description,
//           imageUrl: prod.imageUrl,
//         });
//       });
//       res.status(200).json({
//         message: "Products fetched.",
//         products: retProducts,
//         totalItems: totalItems,
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.getProducts = async (req, res, next) => {
  const prodCatId = req.params.prodCatId;
  const currentPage = req.query.page || 1;
  const perPage = 16;
  let totalItems;

  try{
      totalItems = await product.find({
        prodCatId: prodCatId,
        available: true
      })
      .countDocuments()
      let products = await product
      .find({
        prodCatId: prodCatId,
        available:true
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
      let retProducts = [];
      products.forEach((prod) => {
        retProducts.push({
          _id: prod._id,
          name: prod.name,
          mrp: prod.mrp,
          ourPrice: prod.ourPrice,
          contents: prod.contents,
          description: prod.description,
          imageUrl: prod.imageUrl,
        });
      });
      res.status(200).json({
        message: "Products fetched.",
        products: retProducts,
        totalItems: totalItems,
      });
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSearchProducts = async (req, res, next) => {
  const regex = new RegExp(req.query.search, 'i')
  try{
      let products = await product.find({
        name: regex,
        available: true
      }).exec()
      let retProducts = [];
      products.forEach((prod) => {
        retProducts.push({
          _id: prod._id,
          name: prod.name,
          mrp: prod.mrp,
          ourPrice: prod.ourPrice,
          contents: prod.contents,
          description: prod.description,
          imageUrl: prod.imageUrl,
        });
      });
      res.status(200).json({
        message: "Products fetched.",
        products: retProducts,
      });
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.getProduct = (req, res, next) => {
//   const prodId = req.params.prodId;
//   product
//     .findById(prodId)
//     .then((prod) => {
//       if (!prod) {
//         const error = new Error("Product Not Found.");
//         error.statusCode = 404;
//         throw error;
//       }
//       res.status(200).json({
//         message: "Product fetched.",
//         product: {
//           _id: prod._id,
//           name: prod.name,
//           mrp: prod.mrp,
//           ourPrice: prod.ourPrice,
//           contents: prod.contents,
//           description: prod.description,
//           imageUrl: prod.imageUrl,
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
exports.getProduct = async (req, res, next) => {
  const prodId = req.params.prodId;
  try{
    let prod = await product.findById(prodId)
    if (!prod) {
      const error = new Error("Product Not Found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Product fetched.",
      product: {
        _id: prod._id,
        name: prod.name,
        mrp: prod.mrp,
        ourPrice: prod.ourPrice,
        contents: prod.contents,
        description: prod.description,
        imageUrl: prod.imageUrl,
      },
    });
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.checkProduct = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const { prodId, qty } = req.params;
//   product
//     .findById(prodId)
//     .then((prod) => {
//       if (!prod) {
//         const error = new Error("Product Not Found.");
//         error.statusCode = 404;
//         throw error;
//       }
//       if (prod.stock >= qty) {
//         res.status(200).json({
//           message: "Can be Added",
//           response: true,
//           product:{
//             ourPrice: prod.ourPrice
//           }
//         });
//       }
//       else{
//         res.status(400).json({
//           message: "Quantity Not Available",
//           response: false,
//         });
//       }
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };
exports.checkProduct = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const { prodId, qty } = req.params;
    try{
      let prod = await product.findById(prodId)
      if (!prod) {
        const error = new Error("Product Not Found.");
        error.statusCode = 404;
        throw error;
      }
      if (prod.stock >= qty) {
        res.status(200).json({
          message: "Can be Added",
          response: true,
          product:{
            ourPrice: prod.ourPrice
          }
        });
      }
      else{
        res.status(400).json({
          message: "Quantity Not Available",
          response: false,
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


// exports.addProductToCart = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error();

//     error.statusCode = 422;
//     error.data = errors.array();
//     error.message = error.data[0].msg;
//     throw error;
//   }
//   const {prodId, userId} = req.body;
//   let qty = req.body.qty;
//   qty = parseInt(qty);
//   let findedProduct, message, code;
//   product
//     .findById(prodId)
//     .then((prod) => {
//       if (!prod) {
//         const error = new Error("Product Not Found.");
//         error.statusCode = 404;
//         throw error;
//       }
//       findedProduct = prod;
//       if (prod.stock >= qty) {
//         return Cart.findOne({userId: userId})
//       }
//       else{
//         res.status(400).json({
//           message: "Quantity Not Available",
//           response: false,
//         });
//       }
//     })
//     .then((cart) => {
//       if (!cart) {
//         const error = new Error("Cart Not Found.");
//         error.statusCode = 404;
//         throw error;
//       }
//       let index = cart.products.findIndex((prod) => {
//         return prod.productId === prodId;
//       });
//       if(index == -1 ){
//         cart.products.push({
//           productId: prodId,
//           ourPrice: findedProduct.ourPrice,
//           qty: qty,
//           prodTotal: findedProduct.ourPrice*qty,
//           name: findedProduct.name,
//           contents: findedProduct.contents,
//           mrp: findedProduct.mrp,
//           imageUrl: findedProduct.imageUrl[0]
//         })
//         cart.orderValue+=findedProduct.ourPrice*qty;
//         message = "Added Successfully!!";
//         code = 201;
//         return cart.save();
//       }
//       else{
//         if(cart.products[index].qty+qty <= 4 ){
//           cart.orderValue+=findedProduct.ourPrice*qty;
//           cart.products[index].prodTotal+=qty*findedProduct.ourPrice;
//           cart.products[index].qty+=qty;
//           cart.markModified("products");
//           code=201;
//           message ="Quantity Updated Successfully!!";
//           return cart.save()
//         }
//         else{
//           code=400;
//           message ="Item Already in cart"
//           return cart.save();
//         }
//       }
//     })
//     .then((result)=> {
      
//       res.status(code).json({
//         message:message,
//         cart: {
//           orderValue:result.orderValue,
//           products: result.products
//         }
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// }
exports.addProductToCart = async (req, res, next) => {
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty()) {
      const error = new Error();
  
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const {prodId, userId} = req.body;
    let qty = req.body.qty;
    qty = parseInt(qty);
    let findedProduct, message, code, cart;
    try{
      let prod = await product.findById(prodId)
      if (!prod) {
        const error = new Error("Product Not Found.");
        error.statusCode = 404;
        throw error;
      }
      if (prod.stock >= qty) {
        cart = await Cart.findOne({userId: userId})
      }
      else{
        res.status(400).json({
          message: "Quantity Not Available",
          response: false,
        });
      }
  
      if (!cart) {
        const error = new Error("Cart Not Found.");
        error.statusCode = 404;
        throw error;
      }
      let index = cart.products.findIndex((prod) => {
        return prod.productId === prodId;
      });
      if(index == -1 ){
        cart.products.push({
          productId: prodId,
          ourPrice: prod.ourPrice,
          qty: qty,
          prodTotal: prod.ourPrice*qty,
          name: prod.name,
          contents: prod.contents,
          mrp: prod.mrp,
          imageUrl: prod.imageUrl[0]
        })
        cart.orderValue+=prod.ourPrice*qty;
        message = "Added Successfully!!";
        code = 201;
      }
      else{
        if(cart.products[index].qty+qty <= 4 ){
          cart.orderValue+=prod.ourPrice*qty;
          cart.products[index].prodTotal+=qty*prod.ourPrice;
          cart.products[index].qty+=qty;
          cart.markModified("products");
          code=201;
          message ="Quantity Updated Successfully!!";
        }
        else{
          code=400;
          message ="Item Already in cart"
        }
      }
      cart = await cart.save();
      res.status(code).json({
        message:message,
        cart: {
          orderValue:cart.orderValue,
          products: cart.products
        }
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
}

// exports.removeFromCart = (req,res,next) => {
//   const {prodId, userId} = req.body;
//     Cart.findOne({userId: userId})
//     .then((cart) => {
//       if (!cart) {
//         const error = new Error("Cart Not Found.");
//         error.statusCode = 404;
//         throw error;
//       }
//       let index = cart.products.findIndex((prod) => {
//         return prod.productId === prodId;
//       });
//       if(index == -1 ){
//         res.status(400).json({
//           message:"Can't Remove",
//           cart: {
//             orderValue:cart.orderValue,
//             products: cart.products
//           }
//         });
//       }
//       else{
//         cart.orderValue -= cart.products[index].prodTotal;
//         cart.products.splice(index, 1);
//         cart.markModified("products");
//         res.status(201).json({
//           message:"Item Removed",
//           cart: {
//             orderValue:cart.orderValue,
//             products: cart.products
//           }
//         })
//       }
//       cart.save()
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// }
exports.removeFromCart = async (req,res,next) => {
  const {prodId, userId} = req.body;
  try{
    let cart = await Cart.findOne({userId: userId});
    if (!cart) {
      const error = new Error("Cart Not Found.");
      error.statusCode = 404;
      throw error;
    }
    let index = cart.products.findIndex((prod) => {
      return prod.productId === prodId;
    });
    if(index == -1 ){
      res.status(400).json({
        message:"Can't Remove",
        cart: {
          orderValue:cart.orderValue,
          products: cart.products
        }
      });
    }
    else{
      cart.orderValue -= cart.products[index].prodTotal;
      cart.products.splice(index, 1);
      cart.markModified("products");
      res.status(201).json({
        message:"Item Removed",
        cart: {
          orderValue:cart.orderValue,
          products: cart.products
        }
      })
    }
    cart = await cart.save();
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}



//----------------temperoray disabled----------------------------
exports.postProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();

    error.statusCode = 422;
    error.data = errors.array();
    error.message = error.data[0].msg;
    throw error;
  }
  const prodCatId = req.body.prodCatId;
  const category = req.body.category;
  const name = req.body.name;
  const mrp = req.body.mrp;
  const ourPrice = req.body.ourPrice;
  const contents = req.body.contents;
  const stock = req.body.stock;
  const description = req.body.description;
  const available = req.body.available;
  const imageUrl = req.body.imageUrl;

  const prod = new product({
    prodCatId: prodCatId,
    category: category,
    name: name,
    mrp: mrp,
    ourPrice: ourPrice,
    contents: contents,
    stock: stock,
    description: description,
    available: available,
    imageUrl: imageUrl,
  });

  // posting in db
  prod
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Product Added Successfully!",
        product: { id: new Date().toISOString(), prod: prod },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
