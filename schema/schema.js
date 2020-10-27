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
    phone: String,
    password: String,
    address: String,
    addressTwo: String,
    county: String,
    postalCode: String,
    location: String,
    city: String,
    state: String,
    orders: Array,
    cart: Array,
    favorites: Array,
    notes: String,
    userCart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  },
  { collection: "Users" }
);

var orderSchema = new Schema({
  stripeSessionId: String,
  address: String,
  country: String,
  shipped: Boolean,
  name: String,
  details: String,
  items: Array,
  totalItems: Number,
  vendor: String,
  email: String,
  fulfilled: Boolean,
  paid: Boolean,
  returned: Boolean,
  amount: Number,
  user_id: String,
  guestCheckout: Boolean,
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
