const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const generateOtp = require("../src/utils/generateOtp");
const sendEmailOtp = require("../src/utils/sendEmailOtp");
const sendSmsOtp = require("../src/utils/sendSmsOtp");

const router = express.Router();

// ✅ Supported languages
const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

/**
 * ===============================
 * REQUEST LANGUAGE CHANGE (OTP)
 * ===============================
 */
router.post("/request-language-change", auth, async (req, res) => {
  try {
    const { language } = req.body;
    const user = await User.findById(req.userId);

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    // 🔒 Prevent unnecessary OTP
    if (user.language === language) {
      return res.status(400).json({
        message: "Language already selected"
      });
    }

    // 🔐 Generate OTP
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;

    await user.save();

    // 📩 Conditional OTP delivery
    if (language === "fr") {
      await sendEmailOtp(user.email, otp);
      return res.json({ message: "OTP sent to email" });
    } else {
      await sendSmsOtp(user.phone, otp);
      return res.json({ message: "OTP sent to phone" });
    }
  } catch (err) {
    console.error("Language OTP request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ===================================
 * VERIFY OTP & APPLY LANGUAGE CHANGE
 * ===================================
 */
router.post("/verify-language-otp", auth, async (req, res) => {
  try {
    const { otp, language } = req.body;
    const user = await User.findById(req.userId);

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    if (!user.otp) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP verified → update language
    user.language = language;

    if (language === "fr") {
      user.emailVerified = true;
    } else {
      user.phoneVerified = true;
    }

    // 🧹 Clear OTP
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.json({
      success: true,
      message: "Language changed successfully",
      language: user.language
    });
  } catch (err) {
    console.error("Language OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
