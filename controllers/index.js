const product_category = require('../models/product_category');


exports.postCategories = (req, res, next) => {
    const category = req.body.category;
    const imageUrl = req.body.imageUrl;
    const prodCat = new product_category({
        category: category,
        imageUrl: imageUrl,
    });

    // posting in db
    prodCat
    .save()
    .then(result => {
        res.status(201).json({
            message: "Product-Category Added Successfully!",
            productcat: { id: new Date().toISOString(), poodcat: prodCat },
        })
    })
    .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
};

