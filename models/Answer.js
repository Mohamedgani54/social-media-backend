const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  text: String,

  upvotes: {
    type: Number,
    default: 0
  },

  downvotes: {
    type: Number,
    default: 0
  },
  points: {
  type: Number,
  default: 0
},

  // 👇 ADD THIS
  rewardGiven: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);
