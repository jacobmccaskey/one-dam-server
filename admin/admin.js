const express = require("express");
const mongoose = require("mongoose");
const Schema = require("../schema/schema");
var bodyParser = require("body-parser");
var config = require("../auth/authentication");
var handleError = require("./error");
// var multer = require("multer");
// var fs = require("fs");
// const GridFsStorage = require("multer-gridfs-storage");
// const Grid = require("gridfs-stream");

const app = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var Order = mongoose.model("Order", Schema.orderSchema);
var User = mongoose.model("User", Schema.userSchema);
// var Image = mongoose.model("Image", Schema.imageSchema);
var Inventory = mongoose.model("Inventory", Schema.inventorySchema);

app.get("/db", config.adminAuth, (req, res) => {
  User.find({}, { password: 0 }).exec((err, users) => {
    if (err) {
      res.send(err);
    }
    res.send(users);
  });
});

app.get("/fetchItem/:id", (req, res) => {
  if (!req.params.id) return res.status(404);
  Inventory.findById(req.params.id, (err, item) => {
    if (err) return res.status(400);
    return res.send(item);
  });
});

app.post("/addItem", config.adminAuth, (req, res) => {
  const {
    name,
    images,
    price,
    description,
    vendor,
    quantity,
    sizes,

    gender,
    tags,
  } = req.body;

  // let colorsFormatted = colors.map((color) => ({ color: color }));
  if (images.length === 0) return res.status(400).send(images);

  var inventory = new Inventory({
    name: name,
    price: price,
    images: images,
    description: description,
    vendor: vendor,
    quantity: quantity,
    sizes: sizes,
    gender: gender,
    tags: tags,
    totalOrders: 0,
    returns: 0,
  });
  inventory.save(function (err) {
    if (err)
      return res
        .status(400)
        .send({ response: "problem saving inventory", error: err });
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

app.put("/replinish", config.adminAuth, async (req, res) => {
  let currentInventory;

  await Inventory.findById(req.body.id, (err, item) => {
    if (err) return err;
    return (currentInventory = Number(item.quantity));
  });
  const newInventoryCount =
    Number(currentInventory) + Number(req.body.quantity);

  Inventory.findByIdAndUpdate(
    req.body.id,
    { quantity: newInventoryCount },
    { new: true },
    (err, item) => {
      if (err) return res.status(400);
      res.sendStatus(200).send(item.quantity);
    }
  );
});

app.delete("/delete/:ID", config.adminAuth, (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndDelete(req.params.ID, function (err, item) {
    if (err) return handleError(err);
    res.status(200).send("item deleted");
  });
});

app.get("/orders", config.adminAuth, (req, res) => {
  Order.find().exec((err, orders) => {
    if (err) return res.sendStatus(400);
    res.send(orders);
    res.end();
  });
});

app.delete("/deleteOrder", config.adminAuth, (req, res) => {
  Order.findByIdAndDelete(req.body.id, (err, doc) => {
    if (err) return err;
    return res.send(doc);
  });
});

app.put("/updateOrder", config.adminAuth, (req, res) => {
  const { update } = req.body;
  if (req.params.ID === null) return res.status(404);
  Order.findByIdAndUpdate(req.body.id, update, (err, item) => {
    if (err) return err;
    res.sendStatus(200);
  });
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
