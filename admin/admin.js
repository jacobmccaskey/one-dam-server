const express = require("express");
const mongoose = require("mongoose");
const Schema = require("../schema/schema");
var bodyParser = require("body-parser");

const app = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var User = mongoose.model("User", Schema.userSchema);
var Cart = mongoose.model("Cart", Schema.cartSchema);
var Inventory = mongoose.model("Inventory", Schema.inventorySchema);

app.get("/db", (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      handleError(err);
      res.end();
    }
    res.send(users);
  });
});

app.post("/addItem", (req, res) => {
  const { name, imageUrl, price, description } = req.body;

  var inventory = new Inventory({
    name: name,
    price: price,
    imageUrl: imageUrl,
    description: description,
  });
  inventory.save(function (err) {
    if (err) return handleError(err);
  });
  res.send(inventory);
  res.end();
});

app.put("/update/item/:ID", (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndUpdate(req.params.ID, req.body, function (err) {
    if (err) return res.status(400);
  });
  Inventory.find().exec((err, items) => {
    err ? handleError(err) : res.status(200).send(items);
  });
});

app.delete("/delete/:ID", (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndDelete(req.params.ID, function (err) {
    if (err) return handleError(err);
  });
  Inventory.find().exec((err, items) => {
    if (err) return handleError(err);
    res.status(200).send(items);
  });
});

//display store items
app.get("/store", (req, res) => {
  Inventory.find().exec((err, items) => {
    if (err) {
      handleError(err);
      res.end();
    }
    res.send(items);
  });
});

module.exports = app;
