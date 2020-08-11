var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
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
      name: req.body.name,
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
      res.status(200).send({ auth: true, token: token });
    }
  );
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send("Server Error, Try Again");
    if (!user) return res.status(404).send(req.body.email);
    let validatePassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validatePassword)
      return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: user._id }, config.privateKey, {
      expiresIn: 86400,
    });
    res.status(200).send({
      auth: true,
      token: token,
      name: user.name,
      cart: user.cart,
      address: user.address,
      email: user.email,
    });
  });
});

router.get("/logout", (req, res) => {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;
