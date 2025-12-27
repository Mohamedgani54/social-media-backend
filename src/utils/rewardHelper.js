const User = require("../../models/User");

exports.addPoints = async (userId, points) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { points }
  });
};

exports.reducePoints = async (userId, points) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { points: -points }
  });
};
