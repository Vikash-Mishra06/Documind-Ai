const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fileName: String, 
  text: String,
  embedding: [Number],
});

module.exports = mongoose.model("Document", documentSchema);