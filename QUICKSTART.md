# 🚀 QUICKSTART - Oriental Mini App

Bu faylni o'qib, loyihani 10 daqiqada ishga tushiring!

## ⚡ Tezkor Boshlash (Local Development)

### 1️⃣ Backend Ishga Tushirish (5 daqiqa)

```bash
cd backend

# Virtual environment yaratish
python -m venv venv

# Activate qilish
source venv/bin/activate  # Mac/Linux
# yoki
venv\Scripts\activate  # Windows

# Dependencylarni o'rnatish
pip install -r requirements.txt

# Eski DB dan migration (agar kerak bo'lsa)
python migrate_db.py

# Backend ishga tushirish
python -m app.main
```

✅ Backend: http://localhost:8000
📚 API Docs: http://localhost:8000/docs

### 2️⃣ Frontend Ishga Tushirish (3 daqiqa)

```bash
cd frontend

# Dependencylarni o'rnatish
npm install

# Development server
npm run dev
```

✅ Frontend: http://localhost:5173

### 3️⃣ Bot Ishga Tushirish (2 daqiqa)

```bash
cd bot

# Aiogram o'rnatish
pip install aiogram==2.25.1

# .env fayl yaratish
echo "BOT_TOKEN=your_token" > .env
echo "MINI_APP_URL=http://localhost:5173" >> .env
echo "CHANNEL_USERNAME=@your_channel" >> .env

# Bot ishga tushirish
python bot.py
```

✅ Bot ishlayapti!

## 🐳 Docker bilan Ishga Tushirish (1 daqiqa!)

```bash
# .env yaratish
cp .env.example .env
nano .env  # Token va URLlarni kiriting

# Barcha servislarni ishga tushirish
docker-compose -f docker/docker-compose.yml up -d

# Loglarni ko'rish
docker-compose -f docker/docker-compose.yml logs -f
```

✅ Hammasi ishga tushdi!

## 📱 Telegram Mini App Sozlash

### BotFather'da sozlash:

1. @BotFather ga `/setmenubutton` yuboring
2. Botingizni tanlang
3. **Button text**: "🎓 Darsliklar"
4. **URL**: `https://your-domain.com` (yoki ngrok URL)

### yoki `/newapp` bilan:

1. @BotFather ga `/newapp` yuboring
2. Botingizni tanlang
3. **Title**: "Oriental Darsliklar"
4. **Description**: "Ingliz va Arab tili darslari"
5. **Photo**: Logo yuklang (640x360)
6. **Short name**: oriental_app
7. **URL**: `https://your-domain.com`

## 🌐 Production Deploy (VPS)

### Tezkor deploy skripti:

```bash
# SSH orqali serverga kirish
ssh user@your-server-ip

# Git clone
git clone https://github.com/your-repo/oriental-miniapp.git
cd oriental-miniapp

# .env sozlash
nano docker/.env

# Docker bilan ishga tushirish
docker-compose -f docker/docker-compose.yml up -d

# HTTPS uchun Nginx sozlash (agar kerak bo'lsa)
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Domain sozlash:

1. A record: `your-domain.com` → Server IP
2. SSL certificate olish
3. Nginx reverse proxy sozlash

## 🔧 Dastlabki Konfiguratsiya

### Admin yaratish:

```python
# Python shell'da
from app.crud import crud

# Admin qilish (Telegram ID bilan)
telegram_id = 123456789  # Sizning Telegram ID
crud.make_admin(telegram_id)
```

### Test ma'lumotlar qo'shish:

```bash
python seed_data.py
```

## 🐛 Muammolarni Hal Qilish

### Backend ishlamayapti?
```bash
# Loglarni tekshiring
tail -f logs/backend.log

# Portni tekshiring
lsof -i :8000

# Database mavjudligini tekshiring
ls -la oriental_miniapp.db
```

### Frontend ishlamayapti?
```bash
# Node versiyasini tekshiring (18+ kerak)
node --version

# Cache tozalash
rm -rf node_modules package-lock.json
npm install
```

### Bot javob bermayapti?
```bash
# Token tekshirish
cat .env | grep BOT_TOKEN

# Bot ishga tushgan/tushmaganini tekshirish
ps aux | grep bot.py
```

## 📊 Test Qilish

1. Bot'ga `/start` yuboring
2. Mini App tugmasini bosing
3. Yo'nalish tanlang
4. Kursni oching
5. Darslikni ko'ring

## ✅ Checklist

- [ ] Backend ishga tushdi (localhost:8000)
- [ ] Frontend ishga tushdi (localhost:5173)
- [ ] Bot javob beradi
- [ ] Mini App ochiladi
- [ ] Database yaratildi
- [ ] Admin panel ishlayapti
- [ ] File upload ishlayapti
- [ ] Progress tracking ishlayapti

## 🆘 Yordam

Muammo yuzaga kelsa:

1. README.md ni o'qing
2. Loglarni tekshiring
3. GitHub Issues'ga yozing
4. @anvarcode ga murojaat qiling

## 🎉 Tayyor!

Endi siz to'liq ishlaydigan Mini App'ga egasiz!

**Keyingi qadamlar:**
- [ ] Darsliklar qo'shing
- [ ] Foydalanuvchilarni jalb qiling
- [ ] Analytics monitoring qo'ying
- [ ] Backup strategiya yarating
- [ ] Production ga deploy qiling

---

💡 **Maslahat**: Development jarayonida har bir o'zgarishdan so'ng Git commit qiling!

```bash
git add .
git commit -m "Add feature"
git push origin main
```
