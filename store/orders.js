const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Schema = require("../schema/schema");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
var bodyParser = require("body-parser");
const app = express.Router();
const Order = mongoose.model("Order", Schema.orderSchema);

const endpointSecret = "whsec_3kJ5moLcSWK6ir7QHvWJRngfbcYRH4x0";

const fulfillOrder = (session) => {
  // TODO: fill me in
  console.log("Fulfilling order", session);
};

const formatLineItemsForCheckout = (arrayofItems) => {
  //does some stuff to format stripe checkout object
};

app.post(
  "/webhook",
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

app.post("/checkout-session", async (req, res) => {
  const {
    order,
    user_id,
    name,
    address,
    country,
    postalcode,
    totalitems,
    totalprice,
    guest_bool,
  } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: "mccaskey316@gmail.com",
    billing_address_collection: "required",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 5,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt 2",
          },
          unit_amount: 2000,
        },
        quantity: 44,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "shipping",
          },
          unit_amount: 200,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:3000/paymentsuccess/${session.id}`,
    cancel_url: "http://localhost:3000/checkout",
  });

  Order.create(
    {
      stripeSessionId: session.id,
      name: name,
      user_id: user_id,
      address: address,
      country: country,
      postalCode: postalcode,
      shipped: false,
      details: "",
      items: order,
      fulfilled: false,
      paid: false,
      returned: false,
      vendor: false,
      amount: parseFloat(totalprice),
      totalItems: parseInt(totalitems),
      guestCheckout: guest_bool,
    },
    function (err, order) {
      // console.log(order)
      if (err)
        return res
          .status(400)
          .send("There was a problem with our server. Please try again.");
    }
  );

  res.json({ id: session.id });
});

module.exports = app;
