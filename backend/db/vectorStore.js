const fs = require("fs");

const DB_PATH = "./db/vectors.json";

// initialize file if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// save embeddings
function saveVectors(data) {
  const existing = JSON.parse(fs.readFileSync(DB_PATH));
  const updated = [...existing, ...data];

  fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2));
}

// get all vectors
function getVectors() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}

module.exports = { saveVectors, getVectors };