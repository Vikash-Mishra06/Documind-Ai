const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse/lib/pdf-parse");
const chunkText = require("../utils/chunkText");
const { generateEmbedding } = require("../services/embeddingService");
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

    console.log(`📄 Processing: ${req.file.originalname}`);
    console.log(`👤 User: ${req.user.userId}`);

    // read file
    const dataBuffer = fs.readFileSync(filePath);

    // extract text
    const pdfData = await pdfParse(dataBuffer);
    let extractedText = pdfData.text.trim();

    if (!extractedText || extractedText.length < 50) {
      throw new Error("No meaningful text extracted from PDF");
    }

    console.log(`📝 Extracted text length: ${extractedText.length}`);

    // CLEAN TEXT (important)
    extractedText = extractedText
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // SMART CHUNKING
    const chunks = chunkText(extractedText, 300, 50);

    console.log(`Created ${chunks.length} chunks`);

    // filter valid chunks
    const validChunks = chunks.filter((chunk) => chunk.length > 80);

    if (validChunks.length === 0) {
      throw new Error("No valid chunks after processing");
    }

    // 🔥 OPTIONAL: delete old docs of same file (clean UX)
    await Document.deleteMany({
      userId: req.user.userId,
      fileName: req.file.originalname,
    });

    // generate embeddings and store
    const savedChunks = [];

    for (let i = 0; i < validChunks.length; i++) {
      const chunk = validChunks[i];

      console.log(`⚡ Embedding ${i + 1}/${validChunks.length}`);

      const embedding = await generateEmbedding(chunk);

      const doc = await Document.create({
        userId: req.user.userId,
        fileName: req.file.originalname,
        text: chunk,
        embedding,
      });

      savedChunks.push(doc);
    }

    console.log(`Stored ${savedChunks.length} chunks in DB`);

    res.json({
      message: "Document processed successfully",
      totalChunks: savedChunks.length,
      fileName: req.file.originalname,
    });

  } catch (error) {
    console.error("Upload error:", error.message);

    res.status(500).json({
      error: error.message || "Error processing PDF",
    });
  }
});

module.exports = router;