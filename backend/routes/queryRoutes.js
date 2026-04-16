const express = require("express");
const { generateEmbedding } = require("../services/embeddingService");
const { getVectors } = require("../db/vectorStore");
const { generateAnswer } = require("../services/llmService");
const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");

const router = express.Router();

// cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  return dot / (magA * magB);
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // get stored vectors
    const vectors = await Document.find({
      userId: req.user.userId,
    });

    if (!vectors.length) {
      return res.status(400).json({ error: "No documents indexed yet" });
    }

    // calculate similarity
    const results = vectors.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);

      return {
        text: item.text,
        score,
      };
    });

    // sort by highest score
    results.sort((a, b) => b.score - a.score);

    // top 3 results
    const topResults = results.slice(0, 3);

    // combine context
    const context = topResults.map((r) => r.text).join("\n");

    // generate AI answer
    const answer = await generateAnswer(query, context);

    res.json({
      query,
      answer,
      contextUsed: topResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
