const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("./private.pem", "utf-8");

function isAuthorized(req, res, next) {
  if (typeof req.headers.authorization !== "undefined") {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, privateKey, { algorith: "HS256" }, (err, user) => {
      if (err) {
        res.status(500).json({ error: "Not Authorized" });
        throw new Error("Not Authorized");
      }
      return next();
    });
  } else {
    res.status(500).json({ error: "Not Authorized" });
    throw new Error("Not Authorized");
  }
}

module.exports = { privateKey, isAuthorized };
