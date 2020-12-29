const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const authController = require("./auth/AuthController");
const adminAPI = require("./admin/admin");
const adminController = require("./auth/adminController");
const userHandler = require("./store/userHandler");
const orderHandler = require("./store/checkout");
const stripeHandler = require("./store/stripe");

const mongoose = require("mongoose");
var app = express();
app.use(helmet());
app.use(cors());
var PORT = 4545;
//127.0.0.1    `mongodb://127.0.0.1/test`
const { MONGO_HOSTNAME, MONGO_DB, MONGO_PORT } = process.env;
var mongoDB = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`;
mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log("mongo connection established");
  })
  .catch((err) => console.error(err));
var db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

app.use("/api/auth", authController); //register user
app.use("/api/admin", adminController); // /login
app.use("/api", userHandler); // /addtocart && /store && /updateaccount
app.use("/orders", orderHandler); //listens for payment events from Stripe
app.use("/admin", adminAPI);
app.use("/stripe/", stripeHandler); //order payment & fulfillment

app.listen(PORT, () => {
  console.log("server is live");
});
