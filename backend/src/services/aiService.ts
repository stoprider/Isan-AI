import OpenAI from "openai";
import { ENABLE_AI_API, OPENAI_API_KEY, OPENAI_MODEL } from "../config.js";
import { missions } from "../data/missions.js";
import { evaluateMission } from "./gameEngine.js";

export type AiLanguage = "thai" | "isan";

export interface AiChatOptions {
  language?: AiLanguage;
  studentLevel?: number;
  context?: string;
}

export interface AiChatResult {
  reply: string;
  mode: "live" | "fallback";
  fallback: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

function buildFallbackReply(message: string, language: AiLanguage): string {
  const cleaned = message.trim();
  if (!cleaned) {
    return language === "isan"
      ? "มีคำถามหรือมีเรื่องที่อยากรู้ ก็มาคุยได้เลย"
      : "มีคำถามหรือเรื่องที่อยากรู้ สามารถคุยกับผมได้เลย";
  }

  if (language === "isan") {
    return `กูเข้าใจคำถามของเจ้าแล้ว: "${cleaned}"\n\nAI คือเครื่องมือที่ช่วยคนคิด วิเคราะห์ข้อมูล และทำงานได้เร็ว แต่คนยังต้องเช็กความถูกต้องและตัดสินใจเองเสมอ ควรถามให้ชัดและเช็กข้อมูลก่อนแชร์ต่อ`;
  }

  return `ฉันเข้าใจคำถามของคุณแล้ว: "${cleaned}"\n\nAI คือเครื่องมือที่ช่วยคิด วิเคราะห์ข้อมูล และทำงานได้เร็ว แต่คนยังต้องเช็กความถูกต้องและตัดสินใจเองเสมอ ควรถามให้ชัดและเช็กข้อมูลก่อนแชร์ต่อ`;
}

function buildSystemPrompt(language: AiLanguage, studentLevel: number, context?: string): string {
  const languageText =
    language === "isan"
      ? "ตอบเป็นภาษาอีสานที่เข้าใจง่าย เหมาะกับนักเรียนอายุ 12-15 ปี ใช้สำนวนที่เป็นมิตร ชัดเจน และใกล้ชีวิตจริง"
      : "ตอบเป็นภาษาไทยที่เข้าใจง่าย เหมาะกับนักเรียนอายุ 12-15 ปี ใช้สำนวนที่เป็นมิตร ชัดเจน และใกล้ชีวิตจริง";

  return `คุณเป็นครู AI ที่ช่วยสอนนักเรียนเรื่อง AI และความรับผิดชอบทางดิจิทัล\n${languageText}\n- ตอบสั้น ชัด เข้าใจง่าย\n- ให้ตัวอย่างในชีวิตประจำวัน\n- ถ้าผู้เรียนถามเรื่อง AI ให้เน้นความรับผิดชอบและการตรวจสอบข้อมูล\n- ระดับนักเรียน: ${studentLevel}/7\n${context ? `\nบริบท: ${context}` : ""}`;
}

export async function chatWithAI(
  message: string,
  options: AiChatOptions = {}
): Promise<AiChatResult> {
  const language = options.language ?? "isan";
  const studentLevel = options.studentLevel ?? 1;
  const context = options.context;

  if (!ENABLE_AI_API || !OPENAI_API_KEY) {
    return {
      reply: buildFallbackReply(message, language),
      mode: "fallback",
      fallback: true,
      usage: { promptTokens: 0, completionTokens: 0 }
    };
  }

  try {
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: buildSystemPrompt(language, studentLevel, context) },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0]?.message?.content?.trim() || buildFallbackReply(message, language);

    return {
      reply,
      mode: "live",
      fallback: false,
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0
      }
    };
  } catch (error) {
    console.error("OpenAI chat failed:", error);
    return {
      reply: buildFallbackReply(message, language),
      mode: "fallback",
      fallback: true,
      usage: { promptTokens: 0, completionTokens: 0 }
    };
  }
}

export async function evaluateAnswerWithAI(
  missionId: string,
  answer: string,
  language: AiLanguage = "isan"
) {
  const mission = missions.find((item) => item.id === missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }

  if (!ENABLE_AI_API || !OPENAI_API_KEY) {
    const fallback = evaluateMission(missionId, answer);
    return {
      ...fallback,
      feedback:
        language === "isan"
          ? `ยากกว่าภารกิจนิดนึง แต่ไอเดียหลักของเจ้าเข้าท่าดีแล้ว: ${fallback.feedback}`
          : `คุณกำลังเข้าใจกิจกรรมได้ดีแล้ว: ${fallback.feedback}`,
      completed: fallback.completed,
      mode: "fallback"
    };
  }

  try {
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const prompt = `คุณเป็นครู AI ที่ประเมินนักเรียนรายบุคคล\n- ภารกิจ: ${mission.title}\n- เป้าหมาย: ${mission.objective}\n- คำสำคัญที่ควรมี: ${(mission.answer_key ?? []).join(", ")}\n- คำตอบของนักเรียน: ${answer}\n\nกรุณาตอบเป็น JSON เท่านั้น ในรูปแบบ {"score": 0-100, "feedback": "...", "strengths": ["..."], "improvements": ["..."]} โดยใช้ภาษา${language === "isan" ? "อีสาน" : "ไทย"}`;

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        { role: "system", content: "คุณเป็นครูประเมินผลที่ยุติธรรมและชัดเจน" },
        { role: "user", content: prompt }
      ]
    });

    const responseText = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(responseText) as {
      score?: number;
      feedback?: string;
      strengths?: string[];
      improvements?: string[];
    };

    const score = Math.max(0, Math.min(100, Number(parsed.score ?? 0)));
    const completed = score >= 60;

    return {
      score,
      feedback:
        parsed.feedback ||
        (language === "isan"
          ? "คำตอบของเจ้าเริ่มดีแล้ว ลองทำให้ชัดกว่า"
          : "คำตอบของคุณเริ่มดีแล้ว ลองทำให้ชัดขึ้นอีกนิด"),
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      completed,
      xpEarned: completed ? mission.xp_reward : Math.round(mission.xp_reward * 0.4),
      coinsEarned: completed ? mission.coin_reward : Math.round(mission.coin_reward * 0.4),
      explanation: mission.explanation,
      mode: "live"
    };
  } catch (error) {
    console.error("OpenAI evaluation failed:", error);
    const fallback = evaluateMission(missionId, answer);
    return {
      ...fallback,
      feedback:
        language === "isan"
          ? `ยากกว่าภารกิจนิดนึง แต่ไอเดียหลักของเจ้าเข้าท่าดีแล้ว: ${fallback.feedback}`
          : `คุณกำลังเข้าใจกิจกรรมได้ดีแล้ว: ${fallback.feedback}`,
      completed: fallback.completed,
      mode: "fallback"
    };
  }
}

export async function generateHintWithAI(
  missionId: string,
  studentLevel: number,
  language: AiLanguage = "isan"
): Promise<string> {
  const mission = missions.find((item) => item.id === missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }

  if (!ENABLE_AI_API || !OPENAI_API_KEY) {
    return language === "isan"
      ? `ลองเริ่มจาก ${mission.objective} แล้วพิจารณาให้ครบ เช่น ${mission.answer_key?.slice(0, 3).join(", ") ?? "คำหลัก"}`
      : `ลองเริ่มจาก ${mission.objective} และพิจารณาให้ครบ เช่น ${mission.answer_key?.slice(0, 3).join(", ") ?? "คำหลัก"}`;
  }

  try {
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.6,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: `คุณเป็นครูที่ให้คำใบ้นักเรียนระดับ ${studentLevel}/7 ให้คำแนะนำแบบไม่เปิดเผยคำตอบตรง ๆ โดยใช้ภาษา${language === "isan" ? "อีสาน" : "ไทย"}`
        },
        {
          role: "user",
          content: `ภารกิจ: ${mission.title}\nคำอธิบาย: ${mission.description}\nเป้าหมาย: ${mission.objective}`
        }
      ]
    });

    return completion.choices[0]?.message?.content?.trim() || mission.explanation;
  } catch (error) {
    console.error("OpenAI hint failed:", error);
    return mission.explanation;
  }
}
