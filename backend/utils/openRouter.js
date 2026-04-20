import { OpenRouter } from "@openrouter/sdk";

let openrouter = null;
function getClient() {
  if (!openrouter) {
    const key =
      process.env.OPEN_ROUTER_KEY || process.env.VITE_OPEN_ROUTER_KEY;
    if (!key) {
      console.error(
        "❌ OPEN_ROUTER_KEY (or VITE_OPEN_ROUTER_KEY) is not set in environment!"
      );
    } else {
      console.log(
        `✅ OpenRouter key loaded: ${key.slice(0, 10)}...${key.slice(-4)} (length: ${key.length})`
      );
    }
    openrouter = new OpenRouter({ apiKey: key });
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
    console.error("❌ JSON parse failed:", err.message);
    return null;
  }
};

export const getAIQualityFeedback = async (prompt) => {
  const requestId = Math.random().toString(36).slice(2, 8);
  const model = "deepseek/deepseek-chat";
  const startTime = Date.now();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📤 [${requestId}] OPENROUTER REQUEST`);
  console.log(`   ▸ Model:    ${model}`);
  console.log(`   ▸ Prompt:   ${prompt.slice(0, 150).replace(/\s+/g, " ")}...`);
  console.log(`   ▸ Time:     ${new Date().toISOString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const response = await getClient().chat.send({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const elapsed = Date.now() - startTime;
    const aiMessage = response?.choices?.[0]?.message?.content || "";
    const usage = response?.usage || {};

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📥 [${requestId}] OPENROUTER RESPONSE (${elapsed}ms)`);
    console.log(`   ▸ Model used:    ${response?.model}`);
    console.log(
      `   ▸ Tokens:        prompt=${usage.prompt_tokens || "?"}, completion=${usage.completion_tokens || "?"}, total=${usage.total_tokens || "?"}`
    );
    console.log(
      `   ▸ Finish reason: ${response?.choices?.[0]?.finish_reason}`
    );
    console.log(`   ▸ Raw content:`);
    console.log(aiMessage);
    console.log(`   ▸ Full response object:`);
    console.log(JSON.stringify(response, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const parsed = safeParseJSON(aiMessage);

    if (!parsed || typeof parsed !== "object") {
      console.error(
        `❌ [${requestId}] Failed to parse JSON from AI response`
      );
      return {
        status: 500,
        message: "Invalid JSON returned by AI",
        parsed,
      };
    }

    console.log(`✅ [${requestId}] Successfully parsed:`, parsed);
    return {
      status: 200,
      message: "AI response successfully generated ",
      parsed,
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(`🔥 [${requestId}] OPENROUTER SDK ERROR (${elapsed}ms)`);
    console.error(`   ▸ Error message: ${error.message}`);
    console.error(`   ▸ Error name:    ${error.name}`);
    console.error(`   ▸ Error code:    ${error.code}`);
    console.error(`   ▸ Error status:  ${error.status || error.statusCode}`);
    if (error.response) {
      console.error(`   ▸ HTTP Status:   ${error.response.status}`);
      console.error(`   ▸ Status Text:   ${error.response.statusText}`);
      console.error(
        `   ▸ Response data: ${JSON.stringify(error.response.data || {}, null, 2)}`
      );
    }
    if (error.cause) {
      console.error(`   ▸ Cause:         ${JSON.stringify(error.cause, null, 2)}`);
    }
    console.error(`   ▸ Stack trace:`);
    console.error(error.stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      status: 500,
      message: error.message || "AI generation failed",
      score: 0,
      suggestions: [],
    };
  }
};
