// Imports
var express = require("express");
var router = express.Router();
const Razorpay = require("razorpay");
const PaymentDetail = require("../models/payment-detail");
const { nanoid } = require("nanoid");
// Load config
require("dotenv").config({ path: "./config/config.env" });

// Create an instance of Razorpay
let razorPayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Payment Page
 *
 */
 router.get("/", function (req, res, next) {

    if (req.session.user.email.substring(16, 24) == "iitmandi") {
        PaymentDetail.find({ googleId: req.session.user.googleId }, (errr, doc) => {
            if (errr) {
                console.log(err);
            }
            else {
                if (!doc) {
                    if (req.session.user.email.substring(16, 24) == "iitmandi") {
                        const paymentDetail = new PaymentDetail({
                            orderId: req.session.user.googleId,
                            receiptId: req.session.user.googleId,
                            paymentId: req.session.user.googleId,
                            status: "paid",
                        });
                        try {
                            paymentDetail.save();
                        } catch (err) {
                            // Throw err if failed to save
                            if (err) throw err;
                        }



                    };
                } else {
                    console.log("paid");
                    res.redirect("/profile");
                }
            }
        });
    } else {


        // Render form for accepting amount
        res.render("payment/order", {
            title: "Xpecto '22",
            amount: "100",
        });
    }


});

/**
 * Checkout Page
 *
 */
router.post("/order", function (req, res, next) {
    // console.log("inside /order");
    params = {
        amount: process.env.AMOUNT * 100,
        currency: "INR",
        receipt: nanoid(),
        payment_capture: "1",
    };
    razorPayInstance.orders
        .create(params)
        .then(async (response) => {
            const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
            // Save orderId and other payment details
            const paymentDetail = new PaymentDetail({
                orderId: response.id,
                receiptId: response.receipt,
                amount: response.amount,
                currency: response.currency,
                createdAt: response.created_at,
                status: response.status,
            });
            try {
                // Render Order Confirmation page if saved succesfully
                await paymentDetail.save();
                res.render("payment/checkout", {
                    title: "Confirm Order",
                    razorpayKeyId: razorpayKeyId,
                    paymentDetail: paymentDetail,
                });
            } catch (err) {
                // Throw err if failed to save
                if (err) throw err;
            }
        })
        .catch((err) => {
            // Throw err if failed to create order
            if (err) throw err;
        });
});

/**
 * Verify Payment
 *
 */
router.post("/verify", async function (req, res, next) {
    body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    let crypto = require("crypto");
    let expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    // Compare the signatures
    if (expectedSignature === req.body.razorpay_signature) {
        // if same, then find the previosuly stored record using orderId,
        // and update paymentId and signature, and set status to paid.
        PaymentDetail.findOneAndUpdate(
            { orderId: req.body.razorpay_order_id },
            {
                paymentId: req.body.razorpay_payment_id,
                signature: req.body.razorpay_signature,
                status: "paid",
            },
            { new: true },
            function (err, doc) {
                // Throw er if failed to save
                if (err) {
                    throw err;
                }
                // Render payment success page, if saved succeffully
                res.render("payment/paymentsuccess", {
                    title: "Payment verification successful",
                    paymentDetail: doc,
                });
            }
        );
    } else {
        res.render("payment/fail", {
            title: "Payment verification failed",
        });
    }
});

module.exports = router;
