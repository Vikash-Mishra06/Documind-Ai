const express = require("express");
const cors = require("cors");
require("dotenv").config();
const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);

app.get("/", (req, res) => {
  res.send("DocuMind AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});