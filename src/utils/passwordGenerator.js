const generatePassword = () => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const length = Math.floor(Math.random() * 3) + 8; // 8–10 characters
  let password = "";

  for (let i = 0; i < length; i++) {
    password += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return password;
};

module.exports = generatePassword;
