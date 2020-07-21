const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var inventorySchema = new Schema({
  name: String,
  imageUrl: String,
  price: Number,
  description: String,
});
var userSchema = new Schema(
  {
    name: String,
    email: String,
    userCart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  },
  { collection: "Users" }
);

var cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [],
});

module.exports = { cartSchema, userSchema, inventorySchema };
