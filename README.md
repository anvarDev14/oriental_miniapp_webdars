# Oriental University Telegram Mini App

To'liq Telegram Mini App platformasi - Ingliz va Arab tilini o'rganish uchun.

## 📁 Loyiha Strukturasi

```
oriental-miniapp/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models/          # Database models
│   │   ├── crud/            # CRUD operations
│   │   └── api/             # API endpoints
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── utils/           # Utilities
│   │   ├── store/           # State management
│   │   └── api/             # API client
│   └── package.json
├── bot/              # Telegram bot launcher
│   └── bot.py
└── docker/           # Docker configs
    ├── docker-compose.yml
    └── Dockerfile

```

## 🚀 O'rnatish va Ishga Tushirish

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

Backend http://localhost:8000 da ishga tushadi.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend http://localhost:5173 da ishga tushadi.

### 3. Bot Setup

```bash
cd bot
pip install aiogram==2.25.1
python bot.py
```

### 4. Docker bilan ishga tushirish

```bash
cd docker
docker-compose up -d
```

## 🔧 Konfiguratsiya

### Backend (.env)
```
BOT_TOKEN=your_bot_token_here
DATABASE_PATH=oriental_miniapp.db
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-domain.com
```

### Bot (.env)
```
BOT_TOKEN=your_bot_token_here
MINI_APP_URL=https://your-miniapp-domain.com
CHANNEL_USERNAME=@your_channel
```

## 📊 Database

SQLite database with tables:
- users
- directions (yo'nalishlar)
- courses
- materials (darsliklar)
- user_progress
- favorites
- achievements
- user_achievements
- daily_challenges
- user_challenges
- notes
- analytics_events

## 🎯 Funksiyalar

### User Functions:
- ✅ Yo'nalish tanlash
- ✅ Kurslarni ko'rish
- ✅ Video/Audio/PDF darsliklar
- ✅ Progress tracking
- ✅ XP va level system
- ✅ Achievements
- ✅ Leaderboard
- ✅ Daily challenges
- ✅ Favorites
- ✅ Notes

### Admin Functions:
- ✅ Dashboard
- ✅ Yo'nalishlar CRUD
- ✅ Kurslar CRUD
- ✅ Darsliklar CRUD
- ✅ User management
- ✅ Analytics
- ✅ File upload

## 🔄 Migration

Eski botdan ma'lumotlarni ko'chirish:

```python
from app.models.database import db
db.migrate_from_old_db('path/to/bot_data.db')
```

## 📱 Telegram Mini App Integration

Bot @BotFather orqali Mini App URL ni sozlang:
1. /newapp
2. Mini App URL kiriting
3. Bot'ga /start yuboring

## 🌐 Deployment

### Backend Deployment
```bash
# Uvicorn production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment
```bash
npm run build
# Build papkasini hosting'ga yuklang
```

### VPS bilan
```bash
# Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

## 📝 API Documentation

Backend ishga tushgandan keyin: http://localhost:8000/docs

## 🔐 Authentication

Telegram Mini App init data orqali authentication.
Header: `Authorization: tma <init_data>`

## 💾 Backup

```bash
# Database backup
cp oriental_miniapp.db backups/oriental_miniapp_$(date +%Y%m%d).db
```

## 🐛 Debug

Loglarni ko'rish:
```bash
# Backend logs
tail -f logs/app.log

# Frontend console
Browser DevTools Console

# Bot logs
tail -f logs/bot.log
```

## 👨‍💻 Developer

Developed by @anvarcode

## 📄 License

MIT License
