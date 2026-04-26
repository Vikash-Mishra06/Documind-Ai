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
You are an AI assistant.

RULES:
- Use ONLY given context
- DO NOT add extra explanation
- DO NOT hallucinate
- DO NOT use symbols like #, **, markdown
- Keep output clean plain text

FORMAT:
- Use simple bullet points with "-"
- Keep answers short and accurate

If no info → say:
"I could not find relevant information in the document."
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
        temperature: 0.1,
        max_tokens: 300,
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