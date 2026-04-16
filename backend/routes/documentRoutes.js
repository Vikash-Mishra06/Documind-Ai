const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");

const router = express.Router();

// get user documents
router.get("/", authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({
      userId: req.user.userId,
    }).select("fileName");

    // remove duplicate file names
    const uniqueDocs = [
      ...new Map(docs.map((doc) => [doc.fileName, doc])).values(),
    ];

    res.json({ documents: uniqueDocs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

module.exports = router;
