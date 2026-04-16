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
            content: `
You are an intelligent assistant.

Instructions:
- Answer ONLY using the provided context
- Give a clear, detailed, and structured answer
- If the answer is not in the context, say "I don't have enough information"
- Do not make assumptions
            `,
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion:\n${query}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
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
