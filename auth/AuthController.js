var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
//import user
var Schema = require("../schema/schema");
var User = mongoose.model("User", Schema.userSchema);

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var config = require("./authentication");

router.post("/register", (req, res) => {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  User.create(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    },
    function (err, user) {
      if (err)
        return res
          .status(500)
          .send("There was a problem registering the user.");

      var token = jwt.sign({ id: user._id }, config.privateKey, {
        expiresIn: 86400,
        //24 hours
      });
      res.status(200).send({
        status: 200,
        auth: true,
        token: token,
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
        postalCode: user.postalCode,
        orders: user.orders,
        guest_bool: false,
        guestId: null,
      });
    }
  );
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send("Server Error, Try Again");
    if (!user) return res.status(404).send({ status: 404 });
    let validatePassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validatePassword)
      return res.status(401).send({
        auth: false,
        token: null,
        status: 401,
        guest_bool: true,
        guestId: uuidv4(),
      });
    var token = jwt.sign({ id: user._id }, config.privateKey, {
      expiresIn: 86400,
    });
    res.status(200).send({
      status: 200,
      auth: true,
      token: token,
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

router.get("/logout", (req, res) => {
  res
    .status(200)
    .send({ auth: false, token: null, guest_bool: true, guestId: uuidv4() });
});

module.exports = router;
