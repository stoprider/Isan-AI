# Isan AI - เรียน AI ภาษาอีสาน 🎓

เพลตฟอร์มเรียนรู้ AI แบบเกมิฟายสำหรับเด็กอายุ 12-15 ปี โดยใช้ภาษาอีสานและ OpenAI API

## คุณสมบัติ ✨

- 🎮 **5 Game Modes**: Image, Chat, Detect, Problem Solver, Ethics
- 🌐 **ภาษาอีสานจริง**: คุยกับ AI ได้เป็นอีสาน
- 🤖 **AI ประเมินผล**: ใช้ OpenAI ประเมินคำตอบแบบสมาร์ท
- ⭐ **XP & Levels**: ระบบความก้าวหน้า 7 ระดับ
- 💰 **Coins & Achievements**: รางวัลและสถิติการเรียน
- 📊 **Admin Dashboard**: ติดตามความคืบหน้านักเรียน

## สแต็กเทคโนโลยี 🛠️

**Frontend:**
- React 19 + Vite
- Tailwind CSS
- React Router

**Backend:**
- Express.js
- SQLite (better-sqlite3)
- OpenAI API
- Node.js (ESM)

## ติดตั้ง 🚀

```bash
# Clone repository
git clone https://github.com/stoprider/Isan-AI.git
cd Isan-AI

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start development
npm run dev
```

## ตั้งค่า OpenAI API 🔑

1. ไปที่ https://platform.openai.com/api-keys
2. สร้าง API key ใหม่
3. ใส่ลงใน `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ENABLE_AI_API=true
   OPENAI_MODEL=gpt-4o-mini
   ```

## โครงสร้างโปรเจก 📁

```
.
├── backend/              # Express server + SQLite
│   ├── src/
│   │   ├── services/     # aiService, gameEngine, playerService
│   │   ├── routes/       # game, players, admin, ai
│   │   ├── db/           # database, seed
│   │   ├── data/         # missions.ts
│   │   └── app.ts        # Express setup
│   └── package.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── pages/        # MissionDetailPage, AdminPage, etc.
│   │   ├── components/   # UI components
│   │   ├── hooks/        # useAcademy
│   │   └── lib/          # api, storage utilities
│   └── vite.config.ts
└── docs/                 # Documentation
```

## API Endpoints 🔌

### Game
- `GET /api/game/missions` - ดึงรายการภารกิจ
- `POST /api/game/evaluate` - ประเมินคำตอบ
- `GET /api/game/daily-challenge` - ภารกิจรายวัน

### AI (ใหม่!)
- `POST /api/ai/chat` - คุยกับ AI ภาษาอีสาน
- `POST /api/ai/evaluate` - ประเมินด้วย AI
- `GET /api/ai/hint/:missionId` - ให้คำใบ้

### Players
- `POST /api/players` - สร้าง guest player
- `GET /api/players/:id` - ดึงข้อมูลผู้เล่น
- `POST /api/players/:id/progress` - อัปเดตความคืบหน้า

### Admin
- `GET /api/admin/stats` - สถิติการเรียน
- `GET /api/admin/export` - ส่งออก Excel

## ใช้งาน 💬

### คุยกับ AI
```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "AI คืออะไร",
    "studentLevel": 2,
    "language": "isan"
  }'
```

### ให้คำใบ้
```bash
curl http://localhost:4000/api/ai/hint/lvl1-ai-basics?language=isan&playerLevel=2
```

## การพัฒนา 🔨

```bash
# Start dev server (both frontend & backend)
npm run dev

# Frontend only (port 5173)
cd frontend && npm run dev

# Backend only (port 4000)
cd backend && npm run dev

# Build for production
npm run build

# Run tests
npm --workspace backend run test
```

## Feature Highlights 🌟

### ✅ Isan Language Support
- System prompt ที่ปรับสำหรับภาษาอีสาน
- Fallback responses เมื่อไม่มี OpenAI API
- Feedback ที่เข้าใจง่ายสำหรับเด็ก

### ✅ AI Integration
- Real-time chat with GPT-4o-mini
- Intelligent answer evaluation
- Context-aware hints

### ✅ Gamification
- 7-level progression system
- XP rewards (full + partial)
- Coins for achievements
- Daily challenges

## ขั้นตอนต่อไป 🎯

- [ ] ปรับปรุง Isan dialect prompts
- [ ] เพิ่ม conversation history
- [ ] Implement caching for API calls
- [ ] Add analytics dashboard
- [ ] Deploy to Vercel/Netlify

## ผู้มีส่วนร่วม 👥

- **stoprider** - Creator
- **GitHub Copilot** - Development assistance

## ลิขสิทธิ์ 📄

MIT License - ใช้งานและแก้ไขได้อย่างอิสระ

---

**รับการช่วยเหลือได้ที่:** https://github.com/stoprider/Isan-AI/issues
