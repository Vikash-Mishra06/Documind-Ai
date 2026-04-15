const express = require("express");
const cors = require("cors");
require("dotenv").config();
const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("DocuMind AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});