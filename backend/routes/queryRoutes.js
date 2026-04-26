const express = require("express");
const { generateEmbedding } = require("../services/embeddingService");
const { generateAnswer } = require("../services/llmService");
const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");
const redisClient = require("../config/redis");

const router = express.Router();

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { query: rawQuery, fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    let query = rawQuery.trim().toLowerCase();

    const userId = req.user.userId;
    const cacheKey = `${userId}:${fileName}:${query}`;

    // CACHE
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log("CACHE HIT");
        return res.json(JSON.parse(cached));
      }
    } catch {}

    console.log("CACHE MISS");

    // HANDLE BROAD QUERIES
    const broadQueries = ["all", "everything", "full", "summary"];
    const isBroad = broadQueries.some(q => query.includes(q));

    if (isBroad) {
      const docs = await Document.find({ userId, fileName });

      const context = docs.map(d => d.text).join("\n\n");

      const answer = await generateAnswer(
        "Summarize the entire document clearly without missing details",
        context
      );

      return res.json({ query, answer, contextUsed: [] });
    }

    // NORMAL FLOW
    const queryEmbedding = await generateEmbedding(query);

    const vectors = await Document.find({ userId, fileName });

    if (vectors.length === 0) {
      return res.json({
        query,
        answer: "No document found.",
        contextUsed: [],
      });
    }

    const results = vectors.map(item => ({
      text: item.text,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }));

    results.sort((a, b) => b.score - a.score);

    const topResults = results.slice(0, 5);

    if (topResults[0]?.score < 0.15) {
      return res.json({
        query,
        answer: "I could not find relevant information in the document.",
        contextUsed: [],
      });
    }

    const context = topResults.map(r => r.text).join("\n\n");

    const answer = await generateAnswer(query, context);

    const response = {
      query,
      answer,
      confidence: topResults[0].score,
      contextUsed: topResults,
    };

    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
    } catch {}

    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;