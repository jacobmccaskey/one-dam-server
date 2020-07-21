const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const auth = require("./auth/authentication");
const Schema = require("./schema/schema");

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

//compile model from Schema
var User = mongoose.model("User", Schema.userSchema);
var Cart = mongoose.model("Cart", Schema.cartSchema);
var Inventory = mongoose.model("Inventory", Schema.inventorySchema);

app.get("/jwt", (req, res) => {
  let token = jwt.sign({ body: "stuff" }, "SecretPassphrase", {
    algorithm: "HS256",
  });
  res.send(token);
});

app.get("/secret", auth.isAuthorized, (req, res) => {
  res.json({ message: "Super duper secret" });
});

app.get("/user", (req, res) => {
  User.find()
    .where("name")
    .equals(req.body.username)
    .select("name email")
    .exec((err, user) => {
      if (err) return handleError(err);
      console.log(user);
      res.send(user);
    });
});

app.get("/db", (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      handleError(err);
      res.end();
    }
    res.send(users);
  });
});

app.post("/newuser", (req, res) => {
  let { username, useremail } = req.body;
  var user = new User({
    name: `${username}`,
    email: `${useremail}`,
  });

  user.save(function (err) {
    if (err) return handleError(err);
  });

  var cart = new Cart({
    user: user._id,
    items: [{ shirt: "one good shirt" }],
  });
  cart.save(function (err) {
    if (err) return handleError(err);
  });

  res.send(user);
  res.end();
});

app.post("/admin/addItem", (req, res) => {
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

app.put("/admin/update/item/:ID", (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndUpdate(req.params.ID, req.body, function (err) {
    if (err) return res.status(400);
  });
  Inventory.find().exec((err, items) => {
    err ? handleError(err) : res.status(200).send(items);
  });
});

app.delete("/admin/delete/:ID", (req, res) => {
  if (req.params.ID === null) return res.status(404);
  Inventory.findByIdAndDelete(req.params.ID, function (err) {
    if (err) return handleError(err);
  });
  Inventory.find().exec((err, items) => {
    if (err) return handleError(err);
    res.status(200).send(items);
  });
});

app.get("/admin/dashboard", (req, res) => {
  Inventory.find().exec((err, items) => {
    if (err) {
      handleError(err);
      res.end();
    }
    res.send(items);
  });
});

app.listen(PORT, () => {
  console.log("server is live");
});
