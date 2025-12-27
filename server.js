require("dotenv").config({ path: "./.env.social" });

console.log("ENV CHECK EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("ENV CHECK EMAIL_PORT:", process.env.EMAIL_PORT);


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const answerRoutes = require("./routes/answer");




app.use(cors());
app.use(express.json());

// 🔎 TEMP DEBUG (REMOVE AFTER CONFIRMING)
console.log("MONGO_URI =", process.env.MONGO_URI);

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ Base route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ✅ ROUTES (ALL BEFORE listen)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/friend", require("./routes/friend"));
app.use("/api/post", require("./routes/post"));
app.use("/api/question", require("./routes/question"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/answer", answerRoutes);
app.use("/api/user", require("./routes/user"));
app.use("/api/points", require("./routes/points"));
app.use("/api/language", require("./routes/language"));


// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
