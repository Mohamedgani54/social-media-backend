// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  lastPasswordReset: {
  type: Date,
  default: null
},
subscription: {
  type: String,
  enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
  default: "FREE"
},

subscriptionExpiry: {
  type: Date,
  default: null
},

dailyQuestionCount: {
  type: Number,
  default: 0
},

lastQuestionDate: {
  type: Date,
  default: null
},

  // 🔥 REWARD SYSTEM
  points: {
    type: Number,
    default: 0
  },

  badges: [
    {
      type: String
    }
  ],

  language: {
  type: String,
  enum: ["en", "es", "hi", "pt", "zh", "fr"],
  default: "en"
},

emailVerified: {
  type: Boolean,
  default: false
},

phoneVerified: {
  type: Boolean,
  default: false
},

otp: String,
otpExpiresAt: Date,

loginHistory: [
  {
    ip: String,
    browser: String,
    os: String,
    device: String,   // mobile | desktop
    loginAt: Date
  }
]


}, 


  
{ timestamps: true });



module.exports = mongoose.model("User", userSchema);
