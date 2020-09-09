const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("./private.pem", "utf-8");
const adminKey = fs.readFileSync("./admin.pem", "utf-8");
//this is middleware to validate requests by users or admins,
//private pem files are used to encrypt tokens

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
        .send({ auth: false, token: null, message: "Failed to Authenticate" });
    }

    req.userId = decoded.id;
    next();
  });
}
//validates 24 hour token in any request made by admin
function adminAuth(req, res, next) {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(403)
      .send({ auth: false, message: "You are not logged in" });
  }

  jwt.verify(token, adminKey, (err, decoded) => {
    if (err) {
      return res.status(500).send({
        admin: false,
        edit: "false",
        token: null,
        id: null,
        message: "Failed to Authenticate",
      });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = { privateKey, adminKey, isAuthorized, adminAuth };
