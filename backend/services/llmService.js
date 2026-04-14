const axios = require("axios");

async function generateAnswer(query, context) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer based only on the provided context.",
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion:\n${query}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(error.response?.data || error.message);
    return "Error generating answer";
  }
}

module.exports = { generateAnswer };
