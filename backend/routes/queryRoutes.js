const express = require("express");
const { generateEmbedding } = require("../services/embeddingService");
const { generateAnswer } = require("../services/llmService");
const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");
const redisClient = require("../config/redis");

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

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const rawQuery = req.body.query;
    const query = rawQuery.trim().toLowerCase();
    const userId = req.user.userId;

    const cacheKey = `${userId}:${query}`;
    console.log("Cache Key:", cacheKey);

    // CACHE READ
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log("CACHE HIT ⚡");
        return res.json(JSON.parse(cached));
      }
    } catch {}

    console.log("CACHE MISS ❌");

    const queryEmbedding = await generateEmbedding(query);

    const vectors = await Document.find({ userId });

    if (vectors.length === 0) {
      return res.json({
        query,
        answer: "No documents uploaded yet.",
        contextUsed: [],
      });
    }

    // calculate similarity
    const results = vectors.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return { text: item.text, score };
    });

    // sort by similarity
    results.sort((a, b) => b.score - a.score);

    // 🔥 IMPORTANT FIXES
    const topResults = results.slice(0, 6); // increase from 3 → 6

    console.log("Top scores:", topResults.map(r => r.score.toFixed(3)));

    // better context
    const context = topResults
      .map((r) => r.text)
      .join("\n\n");

    console.log("Context length:", context.length);

    const answer = await generateAnswer(query, context);

    const response = {
      query,
      answer,
      contextUsed: topResults,
    };

    // CACHE STORE
    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
      console.log("Stored in cache ✅");
    } catch {}

    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;