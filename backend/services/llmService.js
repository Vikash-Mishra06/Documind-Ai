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
You are an AI assistant that answers questions from uploaded documents.

IMPORTANT RULES:
- Use ONLY the provided context
- The document may be any type (resume, company policy, technical doc, etc.)
- Extract ONLY relevant information
- DO NOT mix unrelated sections
- DO NOT add extra explanation or assumptions
- If answer is partially available, answer only what is present
- If no relevant info exists, say: "I could not find relevant information in the document."

STRUCTURE RULES:
- If multiple topics → separate clearly with headings
- If listing → use bullet points
- Keep answers short, precise, and clean
- Do NOT repeat the question
- Do NOT explain irrelevant sections

EXAMPLE STYLE:
Leave Policy:
- 20 paid leaves per year
- Sick leave: up to 2 days without approval

Remote Work Policy:
- Up to 3 days per week allowed
- Full-time remote requires approval
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
        temperature: 0.1, // 🔥 more precise
        max_tokens: 350,
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