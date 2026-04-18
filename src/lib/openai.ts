import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIInsight(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cheap, perfect for your dashboard
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Insight temporarily unavailable.";
  }
}