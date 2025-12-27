const express = require("express");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const User = require("../models/User");
const sendInvoiceEmail = require("../src/utils/sendInvoiceEmail");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ⏰ Time check helper
const isPaymentTimeAllowed = () => {
  const now = new Date();
  const istHour = Number(
    now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: false
    })
  );
  return istHour >= 10 && istHour < 11;
};

// 💳 Create order
router.post("/create-order", auth, async (req, res) => {
  try {
    if (!isPaymentTimeAllowed()) {
      return res.status(403).json({
        message: "Payments allowed only between 10–11 AM IST"
      });
    }

    const { plan } = req.body;
    const user = await User.findById(req.userId);

    let amount = 0;
    if (plan === "BRONZE") amount = 100;
    else if (plan === "SILVER") amount = 300;
    else if (plan === "GOLD") amount = 1000;
    else {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // 🧾 Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    // 🔁 Update user subscription
    user.subscription = plan;
    user.dailyQuestionCount = 0;
    user.lastQuestionDate = null;
    await user.save();

    // 📧 SEND INVOICE EMAIL (✅ CORRECT PLACE)
    await sendInvoiceEmail({
      to: user.email,
      plan,
      amount,
      orderId: order.id
    });

    // ✅ Final response
    res.status(200).json({
      orderId: order.id,
      amount,
      plan
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment error" });
  }
});

module.exports = router;
