const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Schema = require("../schema/schema");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
var bodyParser = require("body-parser");
const app = express.Router();
const Order = mongoose.model("Order", Schema.orderSchema);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
