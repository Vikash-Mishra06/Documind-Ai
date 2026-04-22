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
You are an AI assistant that answers questions from documents.

STRICT RULES:
- Use ONLY the provided context
- Combine information from multiple parts if needed
- Extract complete information carefully
- Do NOT say "I don't know" if answer is present anywhere in context
- Give clear, direct answers
- Be specific (list skills, education, experience clearly)
            `,
          },
          {
            role: "user",
            content: `
Context:
${context}

Question:
${query}
            `,
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(error.response?.data || error.message);
    return "Error generating answer";
  }
}

module.exports = { generateAnswer };