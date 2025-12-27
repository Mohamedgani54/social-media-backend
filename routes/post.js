const express = require("express");
const Post = require("../models/post");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * CREATE POST
 * POST /api/post
 */
router.post("/", auth, async (req, res) => {
  try {
    const { text, media } = req.body;

    // 1️⃣ Get logged-in user
    const user = await User.findById(req.userId);
    const friendsCount = user.friends.length;

    // 2️⃣ Rule: No friends → no posts
    if (friendsCount === 0) {
      return res
        .status(403)
        .json({ message: "Add friends to start posting" });
    }

    // 3️⃣ Get today's start time (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4️⃣ Count posts created today by user
    const postsToday = await Post.countDocuments({
      user: req.userId,
      createdAt: { $gte: today }
    });

    // 5️⃣ Apply posting rules
    if (friendsCount <= 2 && postsToday >= friendsCount) {
      return res.status(403).json({
        message: `Daily post limit reached (${friendsCount} posts)`
      });
    }

    // friends > 10 → unlimited (no check needed)

    // 6️⃣ Create post
    const post = new Post({
      user: req.userId,
      text,
      media
    });

    await post.save();

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});
// GET PUBLIC FEED
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const posts = await Post.find({
      user: { $in: [req.userId, ...user.friends] }
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
