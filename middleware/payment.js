// Imports
var express = require("express");
var router = express.Router();
const Razorpay = require("razorpay");
const PaymentDetail = require("../models/payment-detail");
const UserDetail = require("../models/User");
const { nanoid } = require("nanoid");
const code = require("../models/code.js");
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
    if (req.session.user.email.substring(7, 24) == "students.iitmandi") {
        PaymentDetail.find({ googleId: req.session.user.googleId }, async (errr, doc) => {
            if (errr) {
                console.log(errr);
            }
            else {
                if (!doc) {
                    if (req.session.user.email.substring(7, 24) == "students.iitmandi") {
                        const paymentDetail = new PaymentDetail({
                            orderId: req.session.user.googleId,
                            receiptId: req.session.user.googleId,
                            paymentId: req.session.user.googleId,
                            status: "paid",
                        });

                        var userUpdated = await UserDetail.updateOne({ googleId: req.session.user.googleId }, { status: 1 })



                        try {
                            paymentDetail.save();
                        } catch (err) {
                            // Throw err if failed to save
                            if (err) throw err;
                        }



                    };
                } else {
                    var userUpdated = await UserDetail.updateOne({ googleId: req.session.user.googleId }, { status: 1 })
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



//coupon logic

router.post("/coupon", (req, res) => {

    code.find({ code: req.body.couponcode }, async (err, doc) => {
        if (err) {
            console.log(errr);
        } else {
            console.log(doc);
            if (doc.length == 0 || doc[0].used == 1) {
                res.render("payment/fail", {
                    title: "Payment verification failed",
                });

            } else {

                var status = await code.updateOne({ code: req.body.couponcode }, { used: 1 })
                var userUpdated = await UserDetail.updateOne({ googleId: req.session.user.googleId }, { status: 1 })


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

                console.log("paid");
                res.redirect("/profile");


            }
        }
    })
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
        var userUpdated = await UserDetail.updateOne({ googleId: req.session.user.googleId }, { status: 1 })

        req.session.user.status = "1"
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
