const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const resetDailyCountIfNewDay = require("../src/utils/postLimitHelper");

const router = express.Router();

/**
 * CREATE QUESTION
 * POST /api/question
 */
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // 🔹 TASK-3 LOGIC STARTS HERE
    resetDailyCountIfNewDay(user);

    let limit = 1; // FREE

    if (user.subscription === "BRONZE") limit = 5;
    if (user.subscription === "SILVER") limit = 10;
    if (user.subscription === "GOLD") limit = Infinity;

    if (user.dailyQuestionCount >= limit) {
      return res.status(403).json({
        message: "Daily question limit reached for your plan"
      });
    }

    user.dailyQuestionCount += 1;
    await user.save();

    // 🔹 Save question (simple version)
    const question = {
      user: user._id,
      text: req.body.text,
      createdAt: new Date()
    };

    res.status(201).json({
      message: "Question posted successfully",
      question
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
