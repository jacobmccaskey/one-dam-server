const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const authController = require("./auth/AuthController");
const store = require("./admin/admin");
const adminController = require("./auth/adminController");
const userHandler = require("./store/userHandler");

const mongoose = require("mongoose");
var app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
var PORT = 4545;

var mongoDB = "mongodb://127.0.0.1/test";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

app.use("/api/auth", authController);
app.use("/api/admin", adminController); // /login
app.use("/api", userHandler); // /addtocart && /store && /updateaccount

app.use("/admin", store);

app.listen(PORT, () => {
  console.log("server is live");
});
