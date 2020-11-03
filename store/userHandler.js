const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const Schema = require("../schema/schema");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
var bodyParser = require("body-parser");
var Inventory = mongoose.model("Inventory", Schema.inventorySchema);
const app = express.Router();
var User = mongoose.model("User", Schema.userSchema);
var bcrypt = require("bcryptjs");
var config = require("../auth/authentication");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/item/:id", (req, res) => {
  Inventory.findById(req.params.id).exec((err, item) => {
    if (err) {
      return res.status(400).send({ serverResponse: 400 });
    }
    res.send(item);
  });
});

app.get("/store", (req, res) => {
  Inventory.find().exec((err, items) => {
    if (err) {
      res.status(400).send({ serverResponse: 400 });
    }
    res.send(items);
  });
});

app.get("/user", config.isAuthorized, function (req, res, next) {
  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err)
      return res
        .status(500)
        .send("There was a problem finding you.", {
          auth: false,
          guest_bool: true,
          guestId: uuidv4(),
        });
    if (!user)
      return res
        .status(404)
        .send("no users found", {
          auth: false,
          guest_bool: true,
          guestId: uuidv4(),
        });
    res.status(200).send({
      status: 200,
      auth: true,
      firstName: user.firstName,
      lastName: user.lastName,
      cart: user.cart,
      address: user.address,
      addressTwo: user.addressTwo,
      email: user.email,
      phone: user.phone,
      favorites: user.favorites,
      county: user.county,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      orders: user.orders,
      guest_bool: false,
      guestId: null,
    });
  });
});

app.post("/updatefavorites", config.isAuthorized, (req, res, next) => {
  if (!req.body.items) return res.status(400).send("nothing to add here buddy");
  User.findByIdAndUpdate(
    req.userId,
    { favorites: req.body.items },
    { new: true },
    function (err, user) {
      if (err) {
        return res
          .status(500)
          .send(
            "Shucks. There was an issue on our end. Please contact support if this keeps happening."
          );
      }
      if (!user) {
        return res
          .status(404)
          .send(
            "There was a problem finding your account, are you sure you are logged in?"
          );
      }
      res.status(200).send(user.favorites);
    }
  );
});

//can add/delete items from cart. Entire cart is sent and replaced with every request.
app.post("/updatecart", config.isAuthorized, (req, res, next) => {
  if (!req.body.items) return res.status(400).send("bad request");

  User.findByIdAndUpdate(
    req.userId,
    { cart: req.body.items },
    { new: true },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem finding you.");
      if (!user) return res.status(404).send("no users found");
      res.status(200).send(user.cart);
    }
  );
});

//to modify any editable area of user Schema, requires x-access-token header with body.target, body.update
app.post("/updateaccount", config.isAuthorized, (req, res, next) => {
  function updatesAccount(update, id) {
    if (!update) {
      console.log(update);
      return res.status(400).send("no data to update");
    }

    User.findByIdAndUpdate(id, update, { new: true }, (err, user) => {
      if (err) return res.status(404).send("There was a problem finding you.");
      if (!user) return res.status(404).send("no users found");
      res.status(200).send({
        status: 200,
        auth: true,
        firstName: user.firstName,
        lastName: user.lastName,
        cart: user.cart,
        address: user.address,
        addressTwo: user.addressTwo,
        email: user.email,
        phone: user.phone,
        favorites: user.favorites,
        county: user.county,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        orders: user.orders,
      });
    });
  }

  updatesAccount(req.body.update, req.userId);
});

module.exports = app;
