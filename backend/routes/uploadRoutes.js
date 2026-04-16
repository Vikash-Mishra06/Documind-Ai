const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse/lib/pdf-parse");
const chunkText = require("../utils/chunkText");
const { generateEmbedding } = require("../services/embeddingService");
const { saveVectors } = require("../db/vectorStore");
const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");

const router = express.Router();

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// route
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // read file
    const dataBuffer = fs.readFileSync(filePath);

    // extract text
    const pdfData = await pdfParse(dataBuffer);

    const extractedText = pdfData.text;

    const chunks = chunkText(extractedText);

    // generate embedding for first chunk (test)
    const vectorData = [];

    for (let chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      vectorData.push({
        text: chunk,
        embedding,
      });
    }

    // save to DB
    for (let chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      await Document.create({
        userId: req.user.userId,
        text: chunk,
        embedding,
      });
    }

    res.json({
      message: "Embeddings stored successfully",
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing PDF" });
  }
});

module.exports = router;
