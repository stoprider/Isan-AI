import { Router } from "express";
import { missions } from "../data/missions.js";
import { chatWithAI, evaluateAnswerWithAI, generateHintWithAI } from "../services/aiService.js";

export const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {
  try {
    const {
      message,
      context,
      missionId,
      studentLevel = 1,
      language = "isan"
    } = req.body as {
      message?: string;
      context?: string;
      missionId?: string;
      studentLevel?: number;
      language?: "thai" | "isan";
    };

    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const mission = missionId ? missions.find((item) => item.id === missionId) : undefined;
    const result = await chatWithAI(message, {
      language,
      studentLevel,
      context: context || (mission ? `ภารกิจ: ${mission.title} — ${mission.description}` : undefined)
    });

    return res.json({
      reply: result.reply,
      mode: result.mode,
      fallback: result.fallback,
      usage: result.usage
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "AI chat failed"
    });
  }
});

aiRouter.post("/evaluate", async (req, res) => {
  try {
    const { missionId, answer, language = "isan" } = req.body as {
      missionId?: string;
      answer?: string;
      language?: "thai" | "isan";
    };

    if (!missionId || !answer?.trim()) {
      return res.status(400).json({ message: "missionId and answer are required" });
    }

    const result = await evaluateAnswerWithAI(missionId, answer, language);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "AI evaluation failed"
    });
  }
});

aiRouter.get("/hint/:missionId", async (req, res) => {
  try {
    const { missionId } = req.params;
    const { language = "isan", playerLevel = "1" } = req.query as {
      language?: "thai" | "isan";
      playerLevel?: string;
    };

    const result = await generateHintWithAI(missionId, Number(playerLevel) || 1, language);
    return res.json({ hint: result });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "AI hint generation failed"
    });
  }
});
