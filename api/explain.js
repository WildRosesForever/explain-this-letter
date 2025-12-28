import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function setCors(res) {
  // MVP: open CORS. Lock this down to your domain later.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  function extractJson(raw) {
  if (!raw || typeof raw !== "string") return "";

  let s = raw.trim();

  // Remove ```json ... ``` or ``` ... ``` fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // If model added extra text, try to slice from first { to last }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }

  return s.trim();
}


  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { text, tone = "short" } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text" });
    }

    const trimmed = text.trim();
    if (trimmed.length < 30) return res.status(400).json({ error: "Text too short" });
    if (trimmed.length > 12000) return res.status(400).json({ error: "Text too long" });

    const schemaHint =
      "Return ONLY valid JSON with keys: " +
      "meaning, actions, deadlines, consequences, suggested_reply, questions. " +
      "All values must be strings (bullets allowed as \\n- ...). " +
      "If something is not present, write 'Not stated'.";

    const system =
      "You explain letters/emails in plain English. " +
      "Do not invent facts. If the letter is unclear, say what is unclear.";

    const user = `
${schemaHint}

Tone: ${tone} (short = very concise, detailed = more detail)

Task:
1) Explain what this letter/email means in plain language (1–3 sentences).
2) List what the person needs to do (if anything).
3) Extract deadlines/dates (or 'Not stated').
4) What happens if they do nothing (only if stated; otherwise 'Not stated').
5) If a reply is needed, draft a short reply; otherwise 'No reply needed'.
6) Up to 3 clarifying questions if needed.

TEXT:
"""${trimmed}"""
`;

    const resp = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.2
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() || "";

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
  // Retry after stripping code fences and any surrounding text
  const cleaned = extractJson(raw);
  try {
    data = JSON.parse(cleaned);
  } catch {
    return res.status(500).json({
      error: "Model did not return valid JSON",
      raw,
      cleaned
    });
  }
}


    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}
