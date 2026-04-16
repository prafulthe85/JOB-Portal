import { OpenRouter } from "@openrouter/sdk";

let openrouter = null;
function getClient() {
  if (!openrouter) {
    openrouter = new OpenRouter({
      apiKey: process.env.OPEN_ROUTER_KEY,
    });
  }
  return openrouter;
}

const safeParseJSON = (text) => {
  try {
    if (!text || typeof text !== "string") return null;

    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];

    return JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON parse failed:", err);
    return null;
  }
};

export const getAIQualityFeedback = async (prompt) => {
  try {
    const response = await getClient().chat.send({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const aiMessage = response?.choices?.[0]?.message?.content || "";

    const parsed = safeParseJSON(aiMessage);

    if (!parsed || typeof parsed !== "object") {
      return {
        status: 500,
        message: "Invalid JSON returned by AI",
        parsed,
      };
    }

    return {
      status: 200,
      message: "AI response successfully generated ",
      parsed,
    };
  } catch (error) {
    console.error("🔥 OpenRouter SDK Error:", error.message);

    return {
      status: 500,
      message: "AI generation failed",
      score: 0,
      suggestions: [],
    };
  }
};
