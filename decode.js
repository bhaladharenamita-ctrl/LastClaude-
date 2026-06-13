import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple in-memory rate limiter (resets on serverless cold start)
// For production scale, replace with Upstash Redis
const ipMap = new Map();

function getKey(ip) {
  return `${ip}__${new Date().toDateString()}`;
}
function getRemaining(ip) {
  return 15 - (ipMap.get(getKey(ip)) || 0);
}
function increment(ip) {
  const k = getKey(ip);
  ipMap.set(k, (ipMap.get(k) || 0) + 1);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "anon";

  if (getRemaining(ip) <= 0) {
    return res
      .status(429)
      .json({ error: "Daily limit reached. Come back tomorrow 🌙" });
  }

  const { conversation, tone } = req.body || {};

  if (
    !conversation ||
    typeof conversation !== "string" ||
    conversation.trim().length < 5
  ) {
    return res
      .status(400)
      .json({ error: "Please paste a conversation to decode." });
  }
  if (conversation.length > 4000) {
    return res
      .status(400)
      .json({ error: "Conversation too long. Keep it under 4000 chars." });
  }

  const safeTone =
    ["Romantic / Partner", "Friend / Bestie", "Work / Boss", "Family", "Situationship"].includes(tone)
      ? tone
      : "Friend / Bestie";

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system:
        "You are a brutally honest, psychologically sharp Gen Z conversation analyst. " +
        "Decode what people ACTUALLY mean vs what they say. Be witty, sharp, slightly savage. " +
        "Use casual but insightful language. " +
        "Respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.",
      messages: [
        {
          role: "user",
          content:
            `Analyze this conversation. Context: "${safeTone}" relationship.\n\n` +
            `Conversation:\n${conversation.trim()}\n\n` +
            `Respond with ONLY this JSON:\n` +
            `{\n` +
            `  "headline": "Punchy brutal truth max 10 words tabloid style",\n` +
            `  "meanings": [\n` +
            `    "Most likely meaning — 2-3 sentences psychologically sharp",\n` +
            `    "Alternative meaning — 2-3 sentences different angle",\n` +
            `    "Worst case meaning — 2-3 sentences the scary truth"\n` +
            `  ],\n` +
            `  "confidence": <integer 58-96>,\n` +
            `  "redFlag": <true or false>,\n` +
            `  "redFlagReason": "1 sentence if true else null",\n` +
            `  "bestReply": "Exact casual reply. Short. Human. No cringe.",\n` +
            `  "doNotSay": "Reply that would blow everything up",\n` +
            `  "vibe": "One word — Ghosting Avoidant Guilty Interested Checked-out Breadcrumbing Obsessed"\n` +
            `}`,
        },
      ],
    });

    const raw = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const decoded = JSON.parse(raw.replace(/```json|```/g, "").trim());
    increment(ip);

    return res.status(200).json({
      ...decoded,
      remainingToday: getRemaining(ip),
    });
  } catch (err) {
    console.error("decode error:", err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "AI response malformed. Try again." });
    }
    return res.status(500).json({ error: "Something went wrong. Try again 👀" });
  }
}
