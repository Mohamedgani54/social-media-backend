const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/transfer", auth, async (req, res) => {
  const { toUserId, points } = req.body;

  const sender = await User.findById(req.userId);
  const receiver = await User.findById(toUserId);

  if (sender.points <= 10) {
    return res.status(403).json({
      message: "Minimum 10 points required to transfer"
    });
  }

  if (sender.points < points) {
    return res.status(400).json({
      message: "Insufficient points"
    });
  }

  sender.points -= points;
  receiver.points += points;

  await sender.save();
  await receiver.save();

  res.json({
    message: "Points transferred successfully"
  });
});

module.exports = router;
