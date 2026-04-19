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
    console.log(`Processing file: ${req.file.originalname} for user: ${req.user.userId}`);

    // read file
    const dataBuffer = fs.readFileSync(filePath);

    // extract text
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text.trim();

    if (!extractedText) {
      throw new Error("No text extracted from PDF");
    }

    console.log(`Extracted ${extractedText.length} chars`);

    const chunks = chunkText(extractedText);
    console.log(`Created ${chunks.length} chunks, avg length: ${chunks.reduce((a,b)=>a+b.length,0)/chunks.length |0}`);

    // Filter empty chunks
    const validChunks = chunks.filter(chunk => chunk.trim().length > 10);

    if (validChunks.length === 0) {
      throw new Error("No valid chunks after processing");
    }

    // Generate embeddings ONCE and save
    const savedChunks = [];
    for (let i = 0; i < validChunks.length; i++) {
      const chunk = validChunks[i];
      console.log(`Generating embedding ${i+1}/${validChunks.length}`);
      
      const embedding = await generateEmbedding(chunk);

      const doc = await Document.create({
        userId: req.user.userId,
        fileName: req.file.originalname,
        text: chunk,
        embedding,
      });
      savedChunks.push(doc);
    }

    console.log(`Successfully saved ${savedChunks.length} chunks to DB`);

    res.json({
      message: "Document processed and embeddings stored successfully",
      totalChunks: savedChunks.length,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Error processing PDF" });
  }
});

module.exports = router;
