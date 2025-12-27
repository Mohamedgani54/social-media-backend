const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * TRANSFER POINTS
 * Minimum 10 points required to initiate transfer
 */
router.post("/transfer", auth, async (req, res) => {
  try {
    const { toUserId, points } = req.body;

    // 1️⃣ Validate input
    if (!toUserId || !points || points <= 0) {
      return res.status(400).json({ message: "Invalid transfer data" });
    }

    // 2️⃣ Prevent self transfer
    if (toUserId === req.userId) {
      return res.status(400).json({ message: "Cannot transfer points to yourself" });
    }

    // 3️⃣ Get sender & receiver
    const fromUser = await User.findById(req.userId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 4️⃣ Minimum points rule
    if (fromUser.points < 10) {
      return res.status(403).json({
        message: "You must have at least 10 points to transfer"
      });
    }

    // 5️⃣ Sufficient balance check
    if (fromUser.points < points) {
      return res.status(400).json({
        message: "Insufficient points to transfer"
      });
    }

    // 6️⃣ Transfer points
    fromUser.points -= points;
    toUser.points += points;

    await fromUser.save();
    await toUser.save();

    res.json({
      message: "Points transferred successfully",
      transferred: points,
      fromUserBalance: fromUser.points,
      toUserBalance: toUser.points
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
