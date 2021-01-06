const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Schema = require("../schema/schema");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
var bodyParser = require("body-parser");
const app = express.Router();
const Order = mongoose.model("Order", Schema.orderSchema);
const User = mongoose.model("User", Schema.userSchema);
const Inventory = mongoose.model("Inventory", Schema.inventorySchema);
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

//begins bodyParser.json()
app.use(bodyParser.json());

const privateKey = fs.readFileSync("./private.pem", "utf-8");

const currentShippingCostStripe = 700;
const currentShippingCost = 7.0;

const formatLineItemsForCheckoutAndUpdateInventory = async (arrayOfItems) => {
  let lineItems = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: "flat rate shipping",
        },
        unit_amount: currentShippingCostStripe,
      },
      quantity: 1,
    },
  ];
  let totalToCalcTax = 0;
  for (const item of arrayOfItems) {
    let newInventoryCount;
    let totalOrdersUpdate;
    const count = item.count;
    const color = item.color;
    const size = item.size;
    //loops thru each item in cart for accurate pricing and all that cool stuff
    await Inventory.findById(item.id, function (err, itemDetails) {
      if (err) {
        return console.log(err);
      }
      newInventoryCount = itemDetails.quantity - 1;
      if (itemDetails.totalOrders === NaN) totalOrdersUpdate = 1;
      if (itemDetails.totalOrders !== NaN) {
        totalOrdersUpdate = itemDetails.totalOrders + 1;
      }
      const name = itemDetails.name;

      //formats price for stripe line-item data by removing decimal point. stripe checkout
      // does not accept decimals.
      const price = Number.parseFloat(itemDetails.price).toFixed(2);
      const priceFormattedForStripe = Number(price.split(".").join(""));
      //pushes to total price for formatted line item for taxes at 6%
      totalToCalcTax += priceFormattedForStripe * count;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${name} | ${color} | ${size}`,
          },
          unit_amount: priceFormattedForStripe,
        },
        quantity: Number(count),
      });
    });
    // updated inventory with total orders and inventory count
    Inventory.findByIdAndUpdate(
      item.id,
      { quantity: newInventoryCount, totalOrders: totalOrdersUpdate },
      { new: true },
      function (err, item) {
        if (err) return err;
      }
    );
  }
  //last item to push. calculates tax
  const tax = Math.ceil(totalToCalcTax * 0.06);
  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: { name: "tax" },
      unit_amount: Number(tax),
    },
    quantity: 1,
  });
  // console.log(JSON.stringify(lineItems));
  console.log(lineItems);
  return lineItems;
};

app.post("/checkout-session", async (req, res) => {
  const {
    order,
    user_token,
    guest_bool,
    country,
    totalItems,
    name,
    email,
    shipping,
    phone,
    amount,
  } = req.body;

  const orderTotal = Number(amount) + Number(currentShippingCost);

  //binds id to variable for use in initial order to database
  let userId;
  //finds userID
  if (user_token) {
    jwt.verify(user_token, privateKey, (err, decoded) => {
      if (err) return err;
      userId = decoded.id;
    });
  }

  const lineItems = await formatLineItemsForCheckoutAndUpdateInventory(order);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: email,
    billing_address_collection: "required",
    line_items: lineItems,
    mode: "payment",
    success_url: process.env.stripeSuccessUrl,
    cancel_url: process.env.stripeCancelUrl,
  });

  //updates orders of User Account
  if (user_token !== null || guest_bool !== true) {
    let updatedOrders = [];

    const orderSummaryForUserObject = {
      id: session.id,
      order: lineItems,
      time: new Date(),
      paid: false,
      amount: orderTotal.toFixed(2),
    };
    await User.findById(userId, function (err, user) {
      if (err) return err;
      if (user.orders) {
        updatedOrders = user.orders;
      }
    });
    updatedOrders.push(orderSummaryForUserObject);
    await User.findByIdAndUpdate(
      userId,
      { orders: updatedOrders },
      (err, doc) => {
        if (err) return err;
      }
    );
  }
  //creates order for registered account
  if (userId && guest_bool !== true) {
    await Order.create({
      stripeSessionId: session.id,
      address: shipping.address,
      addressTwo: shipping.addressTwo,
      county: shipping.county,
      postalCode: shipping.postalCode,
      city: shipping.city,
      state: shipping.state,
      country: shipping.country,
      shipped: false,
      name: name,
      details: "",
      items: lineItems,
      totalItems: Number(totalItems),
      vendor: "oneDAM",
      email: email,
      phone: phone,
      timeOfOrder: new Date().toString(),
      fulfilled: false,
      paid: false,
      returned: false,
      amount: orderTotal,
      user_id: userId,
      guestCheckout: false,
      guestId: "0000",
    });
  }

  //creates order for guest account
  if (guest_bool === true) {
    await Order.create({
      stripeSessionId: session.id,
      address: shipping.address,
      addressTwo: shipping.addressTwo,
      county: shipping.county,
      postalCode: shipping.postalCode,
      city: shipping.city,
      country: country,
      shipped: false,
      name: name,
      details: "",
      items: lineItems,
      timeOfOrder: new Date().toString(),
      totalItems: Number(totalItems),
      vendor: "oneDAM",
      email: email,
      fulfilled: false,
      paid: false,
      returned: false,
      amount: orderTotal,
      user_id: "guest" + `${uuidv4()}`,
      guestCheckout: true,
      guestId: uuidv4(),
    });
  }

  res.json({ id: session.id });
});

module.exports = app;
