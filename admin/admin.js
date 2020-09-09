const express = require("express");
const mongoose = require("mongoose");
const Schema = require("../schema/schema");
var bodyParser = require("body-parser");
var config = require("../auth/authentication");
var handleError = require("./error");

const app = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var User = mongoose.model("User", Schema.userSchema);
var Cart = mongoose.model("Cart", Schema.cartSchema);
var Inventory = mongoose.model("Inventory", Schema.inventorySchema);

app.get("/db", config.adminAuth, (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      handleError(err);
      res.end();
    }
    res.send(users);
  });
});

app.post("/addItem", config.adminAuth, (req, res) => {
  const {
    name,
    imageUrl,
    images,
    price,
    description,
    vendor,
    quantity,
    sizes,
  } = req.body;

  var inventory = new Inventory({
    name: name,
    price: price,
    imageUrl: imageUrl,
    images: images,
    description: description,
    vendor: vendor,
    quantity: quantity,
    sizes: sizes,
  });
  inventory.save(function (err) {
    if (err) return handleError(err);
  });
  res.send(inventory);
  res.end();
});

app.put("/update/item/:ID", config.adminAuth, (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndUpdate(req.params.ID, req.body, function (err, item) {
    if (err) return res.status(400);
    res.status(200).send(item);
  });

  //sends back entire inventory right now
  // Inventory.find().exec((err, items) => {
  //   err ? handleError(err) : res.status(200).send(items);
  // });
});

app.delete("/delete/:ID", config.adminAuth, (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndDelete(req.params.ID, function (err, item) {
    if (err) return handleError(err);
    res.status(200).send(item);
  });
  // Inventory.find().exec((err, items) => {
  //   if (err) return handleError(err);
  //   res.status(200).send(items);
  // });
});

//display store items
app.get("/store", config.adminAuth, (req, res) => {
  Inventory.find().exec((err, items) => {
    if (err) {
      res.status(400).send("bad request");
      res.end();
    }
    res.send(items);
  });
});

module.exports = app;
