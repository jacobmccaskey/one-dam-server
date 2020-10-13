const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var itemSize = new Schema({
  size: String,
  gender: String,
  quantity: Number,
});

var inventorySchema = new Schema({
  name: String,
  imageUrl: String,
  images: Array,
  price: Number,
  description: String,
  quantity: Number,
  orders: Number,
  colors: [new Schema({ color: String })],
  sizes: [itemSize],
  vendor: String,
  gender: String,
});

var userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    address: String,
    location: String,
    city: String,
    orders: Array,
    cart: Array,
    favorites: Array,
    notes: String,
    userCart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  },
  { collection: "Users" }
);

var orderSchema = new Schema({
  address: String,
  shipped: Boolean,
  name: String,
  details: String,
  items: Array,
  vendor: String,
  email: String,
  fulfilled: Boolean,
});

var adminSchema = new Schema({
  firstName: String,
  lastName: String,
  vendor: String,
  toShip: Array,
  fulfilled: Array,
  orders: Array,
  location: String,
  admin: String,
  edit: Boolean,
  password: String,
});

var cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [],
});

module.exports = {
  cartSchema,
  userSchema,
  inventorySchema,
  adminSchema,
  orderSchema,
  itemSize,
};
