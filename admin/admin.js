const express = require("express");
const mongoose = require("mongoose");
const Schema = require("../schema/schema");
var bodyParser = require("body-parser");
var config = require("../auth/authentication");
var handleError = require("./error");
const AWS = require("aws-sdk");

const app = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var User = mongoose.model("User", Schema.userSchema);
var Cart = mongoose.model("Cart", Schema.cartSchema);
var Inventory = mongoose.model("Inventory", Schema.inventorySchema);

//initialize s3 interface
const s3 = new AWS.S3({
  accessKeyId: process.env.AWSID,
  secretAccessKey: process.env.AWSKEY,
});

//function for uploading file to s3 bucket
const uploadFileToS3 = (filesArr, photoURIS) => {
  filesArr.forEach((file) => {
    const params = {
      Bucket: process.env.BUCKET,
      Key: `${file.name}`,
      Body: file.arrayBuffer,
    };
    s3.upload(params, (err, data) => {
      if (err) throw err;

      return photoURIS.push(data);
    });
  });
};

//fetches all USERS
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
    images,
    price,
    description,
    vendor,
    quantity,
    sizes,
    colors,
  } = req.body;

  const imageUrls = [];
  const colorsFormatted = colors.map((color) => ({ color: color }));

  uploadFileToS3(images, imageUrls);

  var inventory = new Inventory({
    name: name,
    price: price,
    images: imageUrls,
    description: description,
    vendor: vendor,
    quantity: quantity,
    sizes: sizes,
    colors: colorsFormatted,
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
