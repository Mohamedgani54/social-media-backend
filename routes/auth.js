const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generatePassword = require("../src/utils/passwordGenerator");
const UAParser = require("ua-parser-js");
const sendEmailOtp = require("../src/utils/sendEmailOtp");
const generateOtp = require("../src/utils/generateOtp");
const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    friends: []
  });

  await user.save();
  res.json({ message: "User registered successfully" });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();

  const browser = ua.browser.name || "Unknown";
  const os = ua.os.name || "Unknown";

  const isMobile =
    ua.device.type === "mobile" ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(req.headers["user-agent"]);

  const device = isMobile ? "mobile" : "desktop";

  // ⏰ MOBILE TIME RESTRICTION (IST)
  if (device === "mobile") {
    const currentHour = Number(
      new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: false
      })
    );

    if (currentHour < 10 || currentHour >= 13) {
      return res.status(403).json({
        message: "Mobile login allowed only between 10 AM and 1 PM"
      });
    }
  }

  // 🟢 EDGE → DIRECT LOGIN
  if (browser === "Edge") {
    user.loginHistory.push({
      ip: req.ip,
      browser,
      os,
      device,
      loginAt: new Date()
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful (Edge)",
      token,
      userId: user._id
    });
  }

  // 🔐 CHROME → EMAIL OTP
  if (browser === "Chrome") {
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmailOtp(user.email, otp);

    return res.json({
      message: "OTP sent to email. Verify to complete login."
    });
  }

  return res.status(403).json({
    message: "Browser not supported"
  });
});

// otp
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful via OTP",
      token,
      userId: user._id
    });

  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// email
router.get("/test-email", async (req, res) => {
  const sendInvoiceEmail = require("../src/utils/sendInvoiceEmail");

  await sendInvoiceEmail({
    to: "ganihasan43@gmail.com",
    plan: "BRONZE",
    amount: 100,
    orderId: "TEST-EMAIL-001"
  });

  res.json({ message: "Email sent successfully" });
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or phone is required"
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastPasswordReset && user.lastPasswordReset >= today) {
      return res.status(429).json({
        message: "You can request password reset only once per day"
      });
    }

    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    user.lastPasswordReset = new Date();
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
      temporaryPassword: tempPassword
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }


});
  /* 👤 USER PROFILE (POINTS + BADGES) */
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name points badges");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
