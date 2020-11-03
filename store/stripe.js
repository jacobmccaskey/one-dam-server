const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("../schema/schema");
const Order = mongoose.model("Order", Schema.orderSchema);
const User = mongoose.model("User", Schema.userSchema);
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
var bodyParser = require("body-parser");
const app = express.Router();

const endpointSecret = process.env.endpointSecretStripe;

function fulfillOrder(session) {
  //inserts decimal place. originally removed for Stripe checkout API
  const confirmedPaidPrice = Number((session.amount_total / 100).toFixed(2));
  const customerEmail = session.customer_email;
  const filter = { stripeSessionId: session.id };
  const update = { paid: true, amount: confirmedPaidPrice };
  Order.findOneAndUpdate(filter, update, { new: true }, (err, doc) => {
    if (err) return err;
    console.log(doc);
  });
  let ordersArray;
  User.findOne({ email: customerEmail }, (err, user) => {
    if (err) return err;
    ordersArray = user.orders;
  });
  for (const order of ordersArray) {
    if (order.id === session.id) {
      return (order.paid = true);
    }
  }
}

app.post(
  "/paymentRecievedHook",
  bodyParser.raw({ type: "application/json" }),
  (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      console.log(err.message);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Fulfill the purchase...
      fulfillOrder(session);
    }

    response.status(200);
  }
);
module.exports = app;
