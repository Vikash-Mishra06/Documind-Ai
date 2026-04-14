const express = require("express");
const { generateEmbedding } = require("../services/embeddingService");
const { getVectors } = require("../db/vectorStore");

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

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    // generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // get stored vectors
    const vectors = getVectors();

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

    res.json({
      query,
      results: topResults,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;