const resetDailyCountIfNewDay = (user) => {
  const today = new Date().toDateString();

  if (
    !user.lastQuestionDate ||
    user.lastQuestionDate.toDateString() !== today
  ) {
    user.dailyQuestionCount = 0;
    user.lastQuestionDate = new Date();
  }
};

module.exports = resetDailyCountIfNewDay;
