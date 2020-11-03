var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
//import user
var Schema = require("../schema/schema");
var Admin = mongoose.model("Admin", Schema.adminSchema);

var validator = require("validator");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var config = require("./authentication");

//create new admin, delete after creation
router.post("/newadmin", (req, res) => {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  Admin.create(
    {
      admin: req.body.admin,
      edit: true,
      password: hashedPassword,
    },
    (err, user) => {
      if (err)
        return res
          .status(500)
          .send("There was a problem registering the admin");
      var token = jwt.sign({ id: user._id }, config.adminKey, {
        expiresIn: 86400,
      });
      res.status(200).send({ admin: true, token: token });
    }
  );
});

router.get("/user", config.adminAuth, function (req, res, next) {
  Admin.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding you.");
    if (!user) return res.status(404).send("no users found");
    res.status(200).send(user);
  });
});

router.get("/verify", config.adminAuth, function (req, res, next) {
  Admin.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding you.");
    if (!user) return res.status(404).send("no users found");
    res.status(200).send(user);
  });
});

//add validator to req.body
router.post("/login", (req, res) => {
  Admin.findOne({ admin: req.body.admin }, function (err, admin) {
    if (err) return res.status(500).send("Server Error, Try Again");
    if (!admin) return res.status(404).send(req.body.admin);
    let validatePassword = bcrypt.compareSync(
      req.body.password,
      admin.password
    );
    if (!validatePassword)
      return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: admin._id }, config.adminKey, {
      expiresIn: 86400,
    });
    res.status(200).send({ admin: true, token: token });
  });
});

// router.post("/support", (req, res) => {

// });

router.get("/logout", (req, res) => {
  res.status(200).send({ admin: false, token: null });
});

module.exports = router;
