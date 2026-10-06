# OpenAI Integration Guide

เอกสารนี้อธิบายวิธีการเชื่อมต่อ OpenAI API เพื่อให้ Isan AI สามารถคุยภาษาอีสานจริง ๆ

## API Endpoints

### 1. Chat ทั่วไป

**Endpoint:** `POST /api/ai/chat`

```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "AI ช่วยอะไรได้บ้าง",
    "studentLevel": 2,
    "language": "isan",
    "missionId": "lvl1-ai-basics",
    "context": "กำลังเรียนเรื่อง AI โดยทั่วไป"
  }'
```

**Response:**
```json
{
  "reply": "AI เป็นเครื่องมือที่ช่วยคนคิดและวิเคราะห์ข้อมูล...",
  "mode": "live",
  "fallback": false,
  "usage": {
    "promptTokens": 125,
    "completionTokens": 98
  }
}
```

### 2. Evaluate Answer

**Endpoint:** `POST /api/ai/evaluate`

```bash
curl -X POST http://localhost:4000/api/ai/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "missionId": "lvl1-ai-basics",
    "answer": "AI คือเครื่องมือช่วยคนคิด และต้องมีคนตัดสินใจ",
    "language": "isan"
  }'
```

**Response:**
```json
{
  "score": 85,
  "feedback": "ยอดเยี่ยม! คำตอบของเจ้าชัดเจนและถูกต้อง",
  "strengths": ["บอกได้ว่า AI ช่วยคนคิด", "ระบุความสำคัญของมนุษย์"],
  "improvements": ["ลองเพิ่มตัวอย่างเพื่อให้ชัดขึ้น"],
  "completed": true,
  "xpEarned": 20,
  "coinsEarned": 10,
  "explanation": "AI คือเครื่องมือ ไม่ใช่คำตอบ...",
  "mode": "live"
}
```

### 3. Get Hint

**Endpoint:** `GET /api/ai/hint/:missionId`

```bash
curl "http://localhost:4000/api/ai/hint/lvl1-ai-basics?language=isan&playerLevel=2"
```

**Response:**
```json
{
  "hint": "ลองคิดว่า AI ทำได้อะไรบ้าง แล้วลองนึกถึงว่ามนุษย์จำเป็นต้องทำอะไรบ้าง..."
}
```

## Language Support

### Isan Dialect

สำหรับภาษาอีสาน ระบบจะใช้ system prompt ที่ปรับแล้วเพื่อให้ AI ตอบเป็นอีสานที่เข้าใจง่าย:

```
ตอบเป็นภาษาอีสานที่เข้าใจง่าย เหมาะกับนักเรียนอายุ 12-15 ปี
ใช้สำนวนที่เป็นมิตร ชัดเจน และใกล้ชีวิตจริง
```

**ตัวอย่าง Isan responses:**
- "กูเข้าใจคำถามของเจ้าแล้ว"
- "เอาให้ชัดแบบนี้"
- "ไอเดียของเจ้าดีแล้ว"

### Thai Standard

สำหรับภาษาไทยมาตรฐาน:

```
ตอบเป็นภาษาไทยที่เข้าใจง่าย เหมาะกับนักเรียนอายุ 12-15 ปี
ใช้สำนวนที่เป็นมิตร ชัดเจน และ��กล้ชีวิตจริง
```

## Error Handling

### Fallback Mode

ถ้า OpenAI API ไม่พร้อม (ไม่มี API key หรือ API down) ระบบจะใช้ fallback response:

```json
{
  "reply": "กูเข้าใจคำถามของเจ้าแล้ว: \"...\"\n\nAI คือเครื่องมือที่ช่วยคนคิด...",
  "mode": "fallback",
  "fallback": true,
  "usage": { "promptTokens": 0, "completionTokens": 0 }
}
```

### Error Messages

```bash
# Missing required field
{ "message": "message is required" }

# API error
{ "message": "AI chat failed: Rate limit exceeded" }

# Mission not found
{ "message": "Mission not found" }
```

## Cost Optimization

### Model Selection

- **gpt-4o-mini** (recommended): ราคาแพงน้อย แต่เพียงพอสำหรับเรียน
- **gpt-3.5-turbo**: ถูกกว่า แต่อาจช้า
- **gpt-4**: ดีที่สุด แต่แพงมาก

### Token Management

```typescript
// Limit response length to reduce tokens
max_tokens: 400  // for chat
max_tokens: 300  // for evaluation
max_tokens: 180  // for hints
```

### Caching Strategy

*Future enhancement:*
- Cache frequent questions
- Cache standard feedback
- Reuse hints

## Testing

### Local Testing without API

```bash
# ทำให้ ENABLE_AI_API=false
# ระบบจะใช้ fallback mode อัตโนมัติ
```

### Full Integration Testing

```bash
# ตั้ง OPENAI_API_KEY
export OPENAI_API_KEY=sk-proj-...

# รัน backend
cd backend
npm run dev

# ในหน้าต่างอื่น ทดสอบ
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "สวัสดี", "language": "isan"}'
```

## Best Practices

1. **Always provide context** - ให้ `missionId` ถ้าทำได้
2. **Respect language choice** - ถาม language เมื่อสร้าง player
3. **Handle timeouts** - Set request timeout to 30s
4. **Monitor costs** - Track API usage in logs
5. **Graceful degradation** - Fallback ทำงานเสมอ

## Monitoring

### Log Format

```
[OpenAI chat failed: Rate limit exceeded]
[Fallback mode activated for message: "..."]
[AI evaluation: score=85, tokens=223]
```

### Metrics to Track

- Total API calls
- Success vs fallback ratio
- Average response time
- Token usage per call
- Cost per mission

---

For more info: https://platform.openai.com/docs
