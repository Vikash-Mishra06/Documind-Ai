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

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  return dot / (magA * magB);
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    // normalize query
    const rawQuery = req.body.query;
    const query = rawQuery.trim().toLowerCase();
    const userId = req.user.userId;

    const cacheKey = `${userId}:${query}`;
    console.log("Cache Key:", cacheKey);

    // CACHE READ
    let cached = null;

    try {
      cached = await redisClient.get(cacheKey);
    } catch (err) {
      console.log("Redis read failed");
    }

    if (cached) {
      console.log("CACHE HIT");
      return res.json(JSON.parse(cached));
    }

    console.log("CACHE MISS - Query:", query);

    const queryEmbedding = await generateEmbedding(query);
    console.log("Query embedding generated, dim:", queryEmbedding.length);

    // Limit to recent 100 docs for performance
    const vectors = await Document.find({ userId }).sort({ createdAt: -1 }).limit(100);
    console.log(`Found ${vectors.length} user documents`);

    if (vectors.length === 0) {
      return res.json({
        query,
        answer: "No documents uploaded yet. Please upload a PDF first.",
        contextUsed: []
      });
    }

    const results = vectors.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return { text: item.text, score };
    });

    results.sort((a, b) => b.score - a.score);

    console.log("Top 3 scores:", results.slice(0,3).map(r => r.score.toFixed(3)));

    // Filter by threshold 0.3
    const relevantResults = results.filter(r => r.score > 0.3);
    const topResults = relevantResults.slice(0, 3);

    console.log(`Relevant chunks >0.3: ${relevantResults.length}, using top ${topResults.length}`);

    const context = topResults.map((r) => r.text).join("\n\n---\n\n");

    console.log("Context preview:", context.slice(0,200) + (context.length > 200 ? "..." : ""));

    const answer = await generateAnswer(query, context);

    const response = {
      query,
      answer,
      contextUsed: topResults,
    };

    // 🔥 CACHE STORE
    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
      console.log("Stored in cache");
    } catch (err) {
      console.log("Redis write failed");
    }

    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
