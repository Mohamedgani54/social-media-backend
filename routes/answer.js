const express = require("express");
const Answer = require("../models/Answer");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { addPoints, reducePoints } = require("../src/utils/rewardHelper");
const router = express.Router();

/**
 * CREATE ANSWER → +5 points
 */
router.post("/", auth, async (req, res) => {
  const { questionId, text } = req.body;

  const answer = await Answer.create({
    questionId,
    text,
    user: req.userId
  });

  await addPoints(req.userId, 5);

  res.json({
    message: "Answer posted (+5 points)",
    answer
  });
});

/**
 * UPVOTE → bonus at 5 upvotes
 */
router.post("/:id/upvote", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Increase upvotes first
    answer.upvotes += 1;

    let rewardTriggered = false;

    // ✅ Trigger ONLY when it becomes exactly 5
    if (answer.upvotes === 5 && answer.rewardGiven === false) {
      const user = await User.findById(answer.user);
      if (user) {
        user.points += 5;
        await user.save();
      }

      answer.rewardGiven = true;
      rewardTriggered = true;
    }

    await answer.save();

    res.json({
      message: "Upvoted successfully",
      upvotes: answer.upvotes,
      rewardTriggered
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



/**
 * DOWNVOTE → reduce points
 */
router.post("/:id/downvote", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const user = await User.findById(answer.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1️⃣ Increase downvotes
    answer.downvotes += 1;

    let rewardReverted = false;
    let pointsDeducted = 0;

    // 2️⃣ Deduct 1 point for EVERY downvote
    if (user.points > 0) {
      user.points -= 1;
      pointsDeducted += 1;
    }

    // 3️⃣ If reward was given AND upvotes drop below 5 → revert reward
    if (answer.rewardGiven === true && answer.upvotes < 5) {
      user.points = Math.max(0, user.points - 5);
      answer.rewardGiven = false;
      rewardReverted = true;
      pointsDeducted += 5;
    }

    await answer.save();
    await user.save();

    res.json({
      message: "Downvoted successfully",
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
      pointsDeducted,
      rewardReverted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




/**
 * DELETE ANSWER → reduce base points
 */
/**
 * DELETE ANSWER → deduct points
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Only owner can delete
    if (answer.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let pointsDeducted = 5; // base answer points

    // 🔁 Revert upvote bonus if it was given
    if (answer.rewardGiven === true) {
      pointsDeducted += 5;
    }

    // Deduct points from user
    await reducePoints(req.userId, pointsDeducted);

    // Delete answer
    await Answer.deleteOne({ _id: answer._id });

    res.json({
      message: "Answer deleted successfully",
      pointsDeducted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
