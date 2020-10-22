const express = require("express");
const mongoose = require("mongoose");
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
        .send("There was a problem finding you.", { auth: false });
    if (!user) return res.status(404).send("no users found", { auth: false });
    res.status(200).send({
      cart: user.cart,
      favorites: user.favorites,
      address: user.address,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      auth: true,
      status: 200,
    });
  });
});

//can add/delete items from cart. Entire cart is sent and replaced with every request.
app.post("/updatecart", config.isAuthorized, (req, res, next) => {
  if (!req.body.items) return res.status(400).send("bad request");

  // User.findById(req.userId, (err, user) =>
  //   err ? console.log(err) : currentCart.push(user.cart)
  // );

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
  function updatesAccount(target, update, id) {
    if (!update) return res.status(400).send("no data to update");

    User.findByIdAndUpdate(
      id,
      { [target]: update },
      { new: true },
      (err, user) => {
        if (err)
          return res.status(500).send("There was a problem finding you.");
        if (!user) return res.status(404).send("no users found");
        res.status(200).send(`${target}: ${update}`);
      }
    );
  }

  const editable = [
    "password",
    "firstName",
    "lastName",
    "address",
    "email",
    "cart",
  ];
  let canEdit = editable.find((value) => value === req.body.target);

  if (!canEdit) return res.status(400).send("no matching fields");
  if (canEdit === "password") {
    var hashedPassword = bcrypt.hashSync(req.body.update, 8);
    User.findByIdAndUpdate(
      req.userId,
      { password: hashedPassword },
      { new: true },
      (err, user) => {
        if (err)
          return res.status(500).send("There was a problem finding you.");
        if (!user) return res.status(404).send("no users found");
        res.status(200).send("password updated, keep it safe!");
      }
    );
  }
  if (canEdit && canEdit !== "password") {
    updatesAccount(req.body.target, req.body.update, req.userId);
  }
});

module.exports = app;
