const express = require("express");

const handleError = (err) => {
  console.log(err);
  res.send({ error: err });
};
module.exports = handleError;
