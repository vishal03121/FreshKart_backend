// Importing Packages
const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

// importing routes
const indexRoutes = require("./routes/index");
const productRoute = require("./routes/product");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");

// Initializing express app.
const app = express();



app.use(bodyParser.json());
app.use("/public", express.static(path.join(__dirname, 'public')));


// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });
app.use(cors());

// setting up index route "/"
app.use(indexRoutes);
app.use(productRoute);
app.use(userRoute);
app.use('/admin',adminRoute);











// error service
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message || "error found";
    res.status(status).json({
        message: message,
    });
});
  

const PORT = process.env.PORT || 8080;
const DB_STRING = process.env.DB_HOST;

// database connection
mongoose
  .connect(
    DB_STRING,
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then((result) => app.listen(PORT))
  .catch((err) => console.log(err));