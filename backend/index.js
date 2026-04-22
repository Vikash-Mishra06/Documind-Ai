const express = require("express");
const cors = require("cors");
require("dotenv").config();
const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const rateLimit = require("express-rate-limit");

const app = express();

const defaultAllowedOrigins = [
  "https://documind-ai-beta.vercel.app",
  "https://documind-ai-lime.vercel.app",
  "http://localhost:3000"
];

const envAllowedOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.FRONTEND_URL) {
  envAllowedOrigins.push(process.env.FRONTEND_URL.trim());
}

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls and tools without Origin header.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);

app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.send("DocuMind AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
