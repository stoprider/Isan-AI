# ขั้นตอนการติดตั้ง Isan AI 🚀

## ข้อกำหนดเบื้องต้น

- Node.js 18+ 
- npm หรือ yarn
- OpenAI API key (ไม่บังคับ - แต่จำเป็นสำหรับ AI chat จริง)

## ขั้นตอนที่ 1: Clone Repository

```bash
git clone https://github.com/stoprider/Isan-AI.git
cd Isan-AI
```

## ขั้นตอนที่ 2: ติดตั้ง Dependencies

```bash
# ติดตั้ง root dependencies
npm install

# ติดตั้ง workspace dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### สำหรับ Backend

```bash
cd backend
cp ../.env.example .env
```

แก้ไข `.env` ให้ค่าที่ถูกต้อง:

```env
# OpenAI Configuration (ถ้าต้องการใช้ AI จริง)
OPENAI_API_KEY=sk-proj-xxxxxxxxxx
ENABLE_AI_API=true
OPENAI_MODEL=gpt-4o-mini

# Backend
PORT=4000
CORS_ORIGIN=*
DB_PATH=./data/academy.sqlite
```

### สำหรับ Frontend

```bash
cd ../frontend
# สร้าง .env.local (ถ้าต้องการ)
echo 'VITE_API_URL=http://localhost:4000/api' > .env.local
```

## ขั้นตอนที่ 4: รันระบบ Development

```bash
# จากที่ root ของโปรเจก
npm run dev
```

นี่จะเปิด:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000

## ขั้นตอนที่ 5: ทดสอบ AI Chat

### Test ผ่าน curl

```bash
# Chat ภาษาอีสาน
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "AI คืออะไร",
    "studentLevel": 2,
    "language": "isan"
  }'
```

### Test ผ่าน Browser

1. เปิด http://localhost:5173
2. สร้าง Guest Profile
3. ไปที่ Mission Detail
4. คลิก "คุยกับ AI ภาษาอีสาน"
5. พิมพ์คำถาม!

## ขั้นตอนที่ 6: ตั้งค่า OpenAI API Key

### วิธีได้ API Key

1. ไปที่ https://platform.openai.com/api-keys
2. Login หรือ Sign up
3. สร้าง New secret key
4. Copy key ไป `.env` ของ backend

### ทดสอบ API Key

```bash
# ใน backend folder
echo $OPENAI_API_KEY
# ถ้าแสดง key ขึ้นมา OK!
```

## โครงสร้างโปรเจก

```
Isan-AI/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── aiService.ts        ← AI chat, evaluate, hints
│   │   │   ├── gameEngine.ts       ← Scoring logic
│   │   │   ├── playerService.ts    ← Player management
│   │   │   └── adminService.ts     ← Stats & reports
│   │   ├── routes/
│   │   │   ├── ai.ts              ← /api/ai/* endpoints
│   │   │   ├── game.ts            ← /api/game/* endpoints
│   │   │   ├── players.ts         ← /api/players/* endpoints
│   │   │   └── admin.ts           ← /api/admin/* endpoints
│   │   ├── db/
│   │   │   ├── database.ts        ← SQLite setup
│   │   │   └── seed.ts            ← Sample data
│   │   ├── data/
│   │   │   └── missions.ts        ← All mission definitions
│   │   ├── app.ts                 ← Express setup
│   │   ├── config.ts              ← Environment config
│   │   └── server.ts              ← Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MissionDetailPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── MissionCard.tsx
│   │   │   ├── LeaderboardPanel.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useAcademy.ts
│   │   ├── lib/
│   │   │   ├── api.ts             ← API client
│   │   │   └── storage.ts         ← LocalStorage utils
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   ├── SETUP.md              ← You are here!
│   ├── API.md                ← API documentation
│   └── ARCHITECTURE.md       ← System design
├── .env.example
├── README.md
└── package.json
```

## Troubleshooting

### Backend ไม่เริ่ม

```bash
# ลบ node_modules และลองใหม่
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend ไม่เชื่อมต่อ Backend

- ตรวจสอบว่า Backend รันอยู่ที่ port 4000
- ตรวจสอบ `VITE_API_URL` ใน frontend/.env.local
- ลองเปิด Chrome DevTools > Network > ดูว่า request ไปไหน

### AI Chat ไม่ตอบ

- ตรวจสอบ `OPENAI_API_KEY` ใน `.env`
- ตรวจสอบว่า API key ยังมี credits
- ลองรัน fallback mode โดยไม่ตั้ง `OPENAI_API_KEY`

### Database Error

```bash
# Reset database
cd backend
rm -rf data/academy.sqlite
npm run seed
npm run dev
```

## Build สำหรับ Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build

# Result:
# - backend/dist/
# - frontend/dist/
```

## Deploy

- **Frontend**: Vercel, Netlify
- **Backend**: Vercel (serverless), Railway, Render
- **Database**: SQLite (file-based) หรือ PostgreSQL

---

✨ Ready to go! ไปเรียน AI ภาษาอีสานกันเลย 🎓
