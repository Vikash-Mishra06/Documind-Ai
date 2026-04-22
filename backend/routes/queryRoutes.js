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

    // 🔥 smarter query rewrite
    let query = rawQuery.trim().toLowerCase();
    if (query.length < 20) {
      query = `Explain clearly from the document: ${query}`;
    }

    const userId = req.user.userId;
    const cacheKey = `${userId}:${query}`;

    console.log("Query:", query);

    // CACHE READ
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log("CACHE HIT");
        return res.json(JSON.parse(cached));
      }
    } catch {}

    console.log("CACHE MISS");

    const queryEmbedding = await generateEmbedding(query);

    const vectors = await Document.find({ userId });

    if (vectors.length === 0) {
      return res.json({
        query,
        answer: "No documents uploaded yet.",
        contextUsed: [],
      });
    }

    // similarity calculation
    const results = vectors.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return { text: item.text, score };
    });

    results.sort((a, b) => b.score - a.score);

    // better retrieval
    const topResults = results.slice(0, 5);

    console.log("Top scores:", topResults.map(r => r.score.toFixed(3)));

    // fallback if weak matches
    if (topResults[0]?.score < 0.15) {
      return res.json({
        query,
        answer: "I could not find relevant information in the document.",
        contextUsed: [],
      });
    }

    // clean context
    const context = topResults
      .map((r) => r.text)
      .join("\n\n");

    console.log("Context length:", context.length);

    const answer = await generateAnswer(query, context);

    const response = {
      query,
      answer,
      confidence: topResults[0].score, //
      contextUsed: topResults,
    };

    // CACHE STORE
    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
      console.log("Stored in cache");
    } catch {}

    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;