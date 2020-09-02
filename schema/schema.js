const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var inventorySchema = new Schema({
  name: String,
  imageUrl: String,
  images: Array,
  price: Number,
  description: String,
  quantity: Number,
  size: String,
  vendor: String,
});
var userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    address: String,
    location: String,
    orders: Array,
    cart: Array,
    favorites: Array,
    notes: String,
    userCart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  },
  { collection: "Users" }
);

var adminSchema = new Schema({
  firstName: String,
  lastName: String,
  location: String,
  admin: String,
  edit: Boolean,
  password: String,
});

var cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [],
});

module.exports = { cartSchema, userSchema, inventorySchema, adminSchema };
