"""
Oriental University Mini App - Database Models
SQLite database with complete schema for educational platform
"""
import sqlite3
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class Database:
    def __init__(self, db_path: str = 'oriental_miniapp.db'):
        self.db_path = db_path
        self.create_tables()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()
    
    def create_tables(self):
        """Create all database tables"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id BIGINT UNIQUE NOT NULL,
                    username TEXT,
                    full_name TEXT,
                    direction_id INTEGER,
                    xp_points INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    streak_days INTEGER DEFAULT 0,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_admin BOOLEAN DEFAULT 0,
                    FOREIGN KEY (direction_id) REFERENCES directions(id)
                )
            ''')
            
            # Directions (yo'nalishlar) table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS directions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    icon_url TEXT,
                    order_index INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Courses table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    direction_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    level TEXT DEFAULT 'beginner',
                    language TEXT NOT NULL,
                    duration_hours INTEGER DEFAULT 0,
                    thumbnail_url TEXT,
                    order_index INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (direction_id) REFERENCES directions(id) ON DELETE CASCADE
                )
            ''')
            
            # Materials (darsliklar) table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS materials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    course_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    type TEXT NOT NULL,
                    file_id TEXT,
                    file_url TEXT,
                    file_size INTEGER DEFAULT 0,
                    duration INTEGER DEFAULT 0,
                    order_index INTEGER DEFAULT 0,
                    is_free BOOLEAN DEFAULT 1,
                    xp_reward INTEGER DEFAULT 10,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                )
            ''')
            
            # User progress table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    material_id INTEGER NOT NULL,
                    completed BOOLEAN DEFAULT 0,
                    progress_percent INTEGER DEFAULT 0,
                    last_position INTEGER DEFAULT 0,
                    time_spent INTEGER DEFAULT 0,
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
                    UNIQUE(user_id, material_id)
                )
            ''')
            
            # Favorites table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS favorites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    material_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
                    UNIQUE(user_id, material_id)
                )
            ''')
            
            # Achievements table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    icon_url TEXT,
                    xp_reward INTEGER DEFAULT 0,
                    condition_type TEXT NOT NULL,
                    condition_value INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # User achievements table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    achievement_id INTEGER NOT NULL,
                    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
                    UNIQUE(user_id, achievement_id)
                )
            ''')
            
            # Daily challenges table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS daily_challenges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE UNIQUE NOT NULL,
                    challenge_type TEXT NOT NULL,
                    target_value INTEGER DEFAULT 1,
                    xp_reward INTEGER DEFAULT 50,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # User challenges progress
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_challenges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    challenge_id INTEGER NOT NULL,
                    progress INTEGER DEFAULT 0,
                    completed BOOLEAN DEFAULT 0,
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE,
                    UNIQUE(user_id, challenge_id)
                )
            ''')
            
            # Notes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    material_id INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    timestamp INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
                )
            ''')
            
            # Analytics events table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    event_type TEXT NOT NULL,
                    event_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                )
            ''')
            
            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_courses_direction ON courses(direction_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_materials_course ON materials(course_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_progress_material ON user_progress(material_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at)')
            
            logger.info("✅ All database tables created successfully")
    
    # ==================== MIGRATION FROM OLD DB ====================
    
    def migrate_from_old_db(self, old_db_path: str = 'bot_data.db'):
        """Migrate data from old bot database"""
        try:
            old_conn = sqlite3.connect(old_db_path)
            old_conn.row_factory = sqlite3.Row
            old_cursor = old_conn.cursor()
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Migrate faculties to directions
                logger.info("Migrating faculties to directions...")
                old_cursor.execute('SELECT id, name FROM faculties')
                for faculty in old_cursor.fetchall():
                    cursor.execute('''
                        INSERT OR IGNORE INTO directions (id, name, description, is_active)
                        VALUES (?, ?, ?, 1)
                    ''', (faculty['id'], faculty['name'], f"Yo'nalish: {faculty['name']}"))
                
                # Migrate lessons to materials
                logger.info("Migrating lessons to materials...")
                old_cursor.execute('SELECT id, name FROM faculties')
                faculties = {f['id']: f['name'] for f in old_cursor.fetchall()}
                
                for faculty_id, faculty_name in faculties.items():
                    # Create a default course for each faculty
                    cursor.execute('''
                        INSERT OR IGNORE INTO courses 
                        (direction_id, title, description, language, level)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (faculty_id, f"English - {faculty_name}", 
                          "Ingliz tili darslari", "english", "beginner"))
                    
                    course_id = cursor.lastrowid or faculty_id
                    
                    # Migrate lessons
                    old_cursor.execute('''
                        SELECT title, file_id, file_type, description, lesson_number
                        FROM lessons WHERE faculty_id = ?
                    ''', (faculty_id,))
                    
                    for lesson in old_cursor.fetchall():
                        cursor.execute('''
                            INSERT INTO materials 
                            (course_id, title, description, type, file_id, order_index)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (course_id, lesson['title'], lesson['description'],
                              lesson['file_type'] or 'document', lesson['file_id'],
                              lesson['lesson_number'] or 0))
                
                # Migrate users
                logger.info("Migrating users...")
                old_cursor.execute('SELECT user_id, username, full_name, faculty_id FROM users')
                for user in old_cursor.fetchall():
                    cursor.execute('''
                        INSERT OR IGNORE INTO users 
                        (telegram_id, username, full_name, direction_id)
                        VALUES (?, ?, ?, ?)
                    ''', (user['user_id'], user['username'], 
                          user['full_name'], user['faculty_id']))
            
            old_conn.close()
            logger.info("✅ Migration completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Migration failed: {e}")
            return False
    
    # ==================== SEED DATA ====================
    
    def seed_initial_data(self):
        """Add initial achievements and sample data"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Initial achievements
            achievements_data = [
                ("Birinchi qadam", "Birinchi darsni yakunlang", "🎯", 50, "complete_first", 1),
                ("O'quvchi", "10 ta darsni yakunlang", "📚", 100, "complete_lessons", 10),
                ("Qat'iyatli", "7 kun ketma-ket faollik", "🔥", 200, "streak", 7),
                ("Ustoz", "50 ta darsni yakunlang", "🎓", 500, "complete_lessons", 50),
                ("Yulduz", "100 ta darsni yakunlang", "⭐", 1000, "complete_lessons", 100),
            ]
            
            for ach in achievements_data:
                cursor.execute('''
                    INSERT OR IGNORE INTO achievements 
                    (name, description, icon_url, xp_reward, condition_type, condition_value)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', ach)
            
            logger.info("✅ Initial data seeded successfully")


# Global database instance
db = Database()
