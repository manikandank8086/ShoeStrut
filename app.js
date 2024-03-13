const express = require("express");
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
const mongoose = require("mongoose");
const adminRouter = require("./router/admin");
const userRouter = require("./router/user");
const shopRouter = require("./router/shop")
const AdminProductRouter = require("./router/AdminProduct")
const nodemailer = require("nodemailer");
const generateOTP = require("generate-otp");
const dotenv = require('dotenv').config();
const PORT = process.env.PORT;
const app = express();

app.use(nocache());

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MOngodb error"));
db.once("open", () => {
  console.log("connected");
});
 
app.use(express.json());
// session created
app.use(
  session({ 
    name: "session",
    secret: "password", 
    resave: false,
    saveUninitialized: true,
  })
);
//nocache controller
app.use((req, res, next) => {
  res.header("Cache-Control", "no-store,no-cache,private,must-revalidate");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "Public")));
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/product",shopRouter)
app.use("/admin/product",AdminProductRouter)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:7000');
  next();
});

// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// app.use((error,req, res,next) => {
//   console.log(error)
//   console.log(error.message)
//   res.status(error.status || 500);
//   res.render("404page",{});
// });



app.listen(PORT, console.log(`server is running in ${PORT}`));
