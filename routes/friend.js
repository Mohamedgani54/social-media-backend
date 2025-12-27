const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * ADD FRIEND
 * POST /api/friend/add/:friendId
 */
router.post("/add/:friendId", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const friendId = req.params.friendId;

    if (userId === friendId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Add each other as friends
    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * REMOVE FRIEND
 * POST /api/friend/remove/:friendId
 */
router.post("/remove/:friendId", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const friendId = req.params.friendId;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove friend from both users
    user.friends = user.friends.filter(
      id => id.toString() !== friendId
    );

    friend.friends = friend.friends.filter(
      id => id.toString() !== userId
    );

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET FRIEND COUNT
 * GET /api/friend/count
 */
router.get("/count", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ friendsCount: user.friends.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
