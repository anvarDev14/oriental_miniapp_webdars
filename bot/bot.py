"""
Oriental University Bot - Mini App Launcher
Simple bot that launches the Telegram Mini App
"""
from aiogram import Bot, Dispatcher, executor, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.contrib.fsm_storage.memory import MemoryStorage
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = "8549655520:AAEgM1OttD0TCIWvsL-WunY9rt0bbPPKL2A"
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://your-domain.com")  # Replace with your domain
CHANNEL_USERNAME = os.getenv("CHANNEL_USERNAME", "@anvar_code14")  # Replace with your channel

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)


async def check_subscription(user_id: int) -> bool:
    """Check if user is subscribed to the channel"""
    try:
        member = await bot.get_chat_member(CHANNEL_USERNAME, user_id)
        return member.status in ['creator', 'administrator', 'member']
    except Exception as e:
        logger.error(f"Error checking subscription: {e}")
        return False


def get_main_keyboard() -> InlineKeyboardMarkup:
    """Get main menu keyboard with Mini App button"""
    keyboard = InlineKeyboardMarkup(row_width=1)
    
    # Main Web App button
    keyboard.add(
        InlineKeyboardButton(
            text="🎓 Darsliklar va Kurslar",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )
    )
    
    # Additional buttons
    keyboard.add(
        InlineKeyboardButton(text="📊 Statistika", callback_data="stats"),
        InlineKeyboardButton(text="ℹ️ Ma'lumot", callback_data="info")
    )
    
    return keyboard


def get_subscription_keyboard() -> InlineKeyboardMarkup:
    """Get subscription request keyboard"""
    keyboard = InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        InlineKeyboardButton(text="📢 Kanalga a'zo bo'lish", url=f"https://t.me/{CHANNEL_USERNAME[1:]}"),
        InlineKeyboardButton(text="✅ Tekshirish", callback_data="check_subscription")
    )
    return keyboard


@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    """Handle /start command"""
    user = message.from_user
    
    # Check subscription
    is_subscribed = await check_subscription(user.id)
    
    if not is_subscribed:
        await message.answer(
            f"👋 Assalomu alaykum, {user.first_name}!\n\n"
            f"🎓 Oriental University Telegram Mini App'ga xush kelibsiz!\n\n"
            f"📢 Botdan foydalanish uchun kanalimizga a'zo bo'lishingiz kerak:",
            reply_markup=get_subscription_keyboard()
        )
        return
    
    # Show main menu
    await message.answer(
        f"🎉 Xush kelibsiz, {user.first_name}!\n\n"
        f"🎓 Oriental University - Bepul Ingliz va Arab tili darslari\n\n"
        f"📚 Barcha darsliklar va kurslaringizni Mini App'da ko'ring:\n"
        f"   • Video darslar\n"
        f"   • Audio materiallar\n"
        f"   • PDF darsliklar\n"
        f"   • Progress tracking\n"
        f"   • Gamification\n\n"
        f"👇 Quyidagi tugmani bosing:",
        reply_markup=get_main_keyboard()
    )


@dp.callback_query_handler(text="check_subscription")
async def check_subscription_callback(callback: types.CallbackQuery):
    """Check subscription on button press"""
    user_id = callback.from_user.id
    is_subscribed = await check_subscription(user_id)
    
    if is_subscribed:
        await callback.message.edit_text(
            f"✅ Ajoyib! Endi siz botdan foydalanishingiz mumkin.\n\n"
            f"👇 Quyidagi tugmani bosib Mini App'ni oching:",
            reply_markup=get_main_keyboard()
        )
    else:
        await callback.answer(
            "❌ Siz hali kanalga a'zo bo'lmagansiz!\n"
            "Iltimos, kanalga a'zo bo'lib, qaytadan tekshiring.",
            show_alert=True
        )


@dp.callback_query_handler(text="stats")
async def show_stats(callback: types.CallbackQuery):
    """Show user statistics"""
    user = callback.from_user
    
    # In the Mini App, statistics are shown more comprehensively
    await callback.message.edit_text(
        f"📊 Sizning statistikangiz:\n\n"
        f"👤 Foydalanuvchi: {user.first_name}\n"
        f"🆔 ID: {user.id}\n\n"
        f"ℹ️ To'liq statistikani Mini App'da ko'ring!",
        reply_markup=get_main_keyboard()
    )


@dp.callback_query_handler(text="info")
async def show_info(callback: types.CallbackQuery):
    """Show bot information"""
    await callback.message.edit_text(
        f"ℹ️ Oriental University Mini App haqida:\n\n"
        f"🎓 Bu platforma orqali siz bepul ingliz va arab tillarini o'rganishingiz mumkin.\n\n"
        f"📚 Imkoniyatlar:\n"
        f"   • Video va audio darslar\n"
        f"   • PDF materiallar\n"
        f"   • Progress tracking\n"
        f"   • Gamification (XP, achievements)\n"
        f"   • Leaderboard\n"
        f"   • Daily challenges\n\n"
        f"💡 Barcha funksiyalar Mini App'da mavjud!\n\n"
        f"👨‍💻 Dasturchi: @anvarcode\n"
        f"📞 Savol va takliflar uchun: @sam_oriental_bot",
        reply_markup=get_main_keyboard()
    )


@dp.message_handler(commands=['help'])
async def cmd_help(message: types.Message):
    """Handle /help command"""
    await message.answer(
        f"❓ Yordam\n\n"
        f"📱 Mini App'ni ochish uchun /start buyrug'ini yuboring.\n\n"
        f"🔘 Mavjud buyruqlar:\n"
        f"   /start - Botni ishga tushirish\n"
        f"   /help - Yordam\n\n"
        f"ℹ️ Barcha darsliklar va funksiyalar Mini App'da!",
        reply_markup=get_main_keyboard()
    )


@dp.message_handler(commands=['admin'])
async def cmd_admin(message: types.Message):
    """Handle /admin command"""
    # Simple admin check (you can improve this)
    ADMIN_IDS = [123456789]  # Replace with your admin Telegram IDs
    
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("❌ Bu buyruq faqat adminlar uchun!")
        return
    
    admin_keyboard = InlineKeyboardMarkup(row_width=1)
    admin_keyboard.add(
        InlineKeyboardButton(
            text="👨‍💼 Admin Panel",
            web_app=WebAppInfo(url=f"{MINI_APP_URL}/admin")
        )
    )
    
    await message.answer(
        f"👨‍💼 Admin Panel\n\n"
        f"Mini App orqali barcha kontentni boshqaring:\n"
        f"   • Yo'nalishlar\n"
        f"   • Kurslar\n"
        f"   • Darsliklar\n"
        f"   • Foydalanuvchilar\n"
        f"   • Statistika",
        reply_markup=admin_keyboard
    )


@dp.message_handler()
async def echo_handler(message: types.Message):
    """Handle all other messages"""
    await message.answer(
        f"👋 Salom! Men Oriental University botiman.\n\n"
        f"📱 Mini App'ni ochish uchun /start ni bosing.\n"
        f"❓ Yordam kerakmi? /help",
        reply_markup=get_main_keyboard()
    )


async def on_startup(dp):
    """Actions on bot startup"""
    logger.info("🚀 Bot ishga tushdi!")
    logger.info(f"📱 Mini App URL: {MINI_APP_URL}")


async def on_shutdown(dp):
    """Actions on bot shutdown"""
    logger.info("👋 Bot to'xtatildi!")
    await dp.storage.close()


if __name__ == '__main__':
    executor.start_polling(
        dp,
        skip_updates=True,
        on_startup=on_startup,
        on_shutdown=on_shutdown
    )
