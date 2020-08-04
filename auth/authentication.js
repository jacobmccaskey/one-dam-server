const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("./private.pem", "utf-8");
const adminKey = fs.readFileSync("./admin.pem", "utf-8");

function isAuthorized(req, res, next) {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(403)
      .send({ auth: false, message: "You are not logged in" });
  }

  jwt.verify(token, privateKey, (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: "Failed to Authenticate" });
    }

    req.userId = decoded.id;
    next();
  });
}

function adminAuth(req, res, next) {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(403)
      .send({ auth: false, message: "You are not logged in" });
  }

  jwt.verify(token, adminKey, (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .send({
          admin: false,
          edit: "false",
          id: null,
          message: "Failed to Authenticate",
        });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = { privateKey, adminKey, isAuthorized, adminAuth };
