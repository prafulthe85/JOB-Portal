import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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
    console.error("❌ JSON parse failed:", err.message);
    return null;
  }
};

export const getAIQualityFeedback = async (prompt) => {
  const key =
    process.env.OPEN_ROUTER_KEY || process.env.VITE_OPEN_ROUTER_KEY;

  if (!key) {
    console.error("❌ No OpenRouter key found in env!");
    return {
      status: 500,
      message: "AI key missing",
      score: 0,
      suggestions: [],
    };
  }

  console.log(
    `🔑 Using key: ${key.slice(0, 12)}...${key.slice(-4)} (length: ${key.length})`
  );

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "CareerConnect Job Portal",
        },
        timeout: 60000,
      }
    );

    const aiMessage = response?.data?.choices?.[0]?.message?.content || "";
    console.log("📩 Raw AI message:", aiMessage.slice(0, 200));

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
      message: "AI response successfully generated",
      parsed,
    };
  } catch (error) {
    console.error("🔥 OpenRouter HTTP Error:");
    console.error("   message:", error.message);
    console.error("   status:", error.response?.status);
    console.error("   data:", JSON.stringify(error.response?.data));

    return {
      status: 500,
      message: error.response?.data?.error?.message || "AI generation failed",
      score: 0,
      suggestions: [],
    };
  }
};
