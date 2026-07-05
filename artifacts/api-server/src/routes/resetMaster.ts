import { Router, type IRouter } from "express";
import {
  GenerateResetMasterGuidanceBody,
  GenerateResetMasterGuidanceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = [
  "You are 'Reset Master', a calm, disciplined mentor inside a self-help app that helps people break compulsive digital habits (such as pornography, dating apps, endless scrolling, or in-app spending).",
  "A user is practicing a simulated weak moment before it happens in real life. They have told you the scenario and the action they chose to take. Give them brief guidance for that exact moment.",
  "",
  "Rules you must always follow:",
  "- Respond in 2 to 4 short sentences. Never more.",
  "- Be calm, grounded, disciplined, and quietly encouraging. Never shaming, never judgmental, never preachy.",
  "- Speak directly to the user as 'you'. Reinforce their agency and affirm the action they chose.",
  "- Remind them, when it fits, that the urge is temporary and will pass.",
  "- Do NOT give medical, clinical, psychiatric, or therapeutic advice. Do NOT diagnose anything.",
  "- Do NOT use emojis. Do NOT use markdown. Return plain text only.",
  "- Do NOT ask questions or invite further conversation. This is one-time guidance, not a chat.",
].join("\n");

router.post("/reset-master/guidance", async (req, res) => {
  const parsed = GenerateResetMasterGuidanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { simulation, action, goal, habit } = parsed.data;

  const userPrompt = [
    `Simulated weak moment: ${simulation}.`,
    `The action I chose: ${action}.`,
    `My goal: ${goal && goal.trim() ? goal.trim() : "not specified"}.`,
    `Habit I am breaking: ${habit && habit.trim() ? habit.trim() : "not specified"}.`,
  ].join("\n");

  try {
    const { openai } = await import("@workspace/integrations-openai-ai-server");

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const guidance = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!guidance) {
      req.log.error("Reset Master returned empty guidance");
      res.status(500).json({ error: "Guidance unavailable" });
      return;
    }

    const data = GenerateResetMasterGuidanceResponse.parse({ guidance });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Reset Master guidance generation failed");
    res.status(500).json({ error: "Guidance unavailable" });
  }
});

export default router;
