const paymentRoute = require("express").Router();
const Razorpay = require("razorpay");
const shortid = require("shortid");
// const bodyParser = require("body-parser");
const crypto = require("crypto");
// require("dotenv").config();

// paymentRoute.use(bodyParser.json());

var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

paymentRoute.get("/", (req, res) => {
    res.render("payment");
});

paymentRoute.post("/verification", (req, res) => {
    Razorpay.payment.fetch(req.body.razorpay_payment_id).then((info) => {
        console.log("info = \n", info);
    });
});
// paymentRoute.post("/verify", (req, res) => {
//     const secret = "razorpaysecret";

//     console.log(req.body);

//     const shasum = crypto.createHmac("sha256", secret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     console.log(digest, req.headers["x-razorpay-signature"]);

//     if (digest === req.headers["x-razorpay-signature"]) {
//         console.log("request is legit");
//         res.status(200).json({
//             message: "OK",
//         });
//     } else {
//         res.status(403).json({ message: "Invalid" });
//     }
// });

paymentRoute.post("/razorpay", async (req, res) => {
    const payment_capture = 1;
    const amount = 100;
    const currency = "INR";

    const options = {
        amount,
        currency,
        receipt: shortid.generate(),
        payment_capture,
    };

    try {
        const response = await razorpay.orders.create(options);
        console.log("/razorpay = ", response);
        res.status(200).json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send("Unable to create order");
    }
});

module.exports = paymentRoute;
