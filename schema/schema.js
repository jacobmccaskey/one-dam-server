const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var sizeVariant = new Schema({
  size: String,
  variant: [
    new Schema({
      color: String,
      quantity: Number,
    }),
  ],
});

var inventorySchema = new Schema({
  name: String,
  imageUrl: String,
  images: Array,
  price: Number,
  description: String,
  quantity: Number,
  orders: Number,
  returns: Number,
  colors: [new Schema({ color: String })],
  sizes: [sizeVariant],
  vendor: String,
  gender: String,
  totalOrders: Number,
  tags: Array,
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

var messageSupportSchema = new Schema({
  userId: String,
  userEmail: String,
  user: Object,
  time: String,
  read: Boolean,
});

var orderSchema = new Schema({
  stripeSessionId: String,
  address: String,
  addressTwo: String,
  county: String,
  postalCode: String,
  city: String,
  state: String,
  country: String,
  shipped: Boolean,
  name: String,
  details: String,
  items: Array,
  totalItems: Number,
  vendor: String,
  email: String,
  phone: String,
  fulfilled: Boolean,
  paid: Boolean,
  returned: Boolean,
  amount: Number,
  user_id: String,
  timeOfOrder: String,
  guestCheckout: Boolean,
  guestId: String,
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

var imageSchema = new Schema({
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = {
  cartSchema,
  userSchema,
  inventorySchema,
  adminSchema,
  orderSchema,
  sizeVariant,
  messageSupportSchema,
  imageSchema,
};
