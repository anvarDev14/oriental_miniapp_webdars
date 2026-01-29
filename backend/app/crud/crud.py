"""
CRUD Operations for Oriental Mini App
All database operations for users, courses, materials, etc.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from app.models.database import db
import logging

logger = logging.getLogger(__name__)


# ==================== USERS ====================

def create_user(telegram_id: int, username: str = None, full_name: str = None) -> Optional[int]:
    """Create new user or return existing"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO users (telegram_id, username, full_name)
                VALUES (?, ?, ?)
            ''', (telegram_id, username, full_name))
            
            cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (telegram_id,))
            user = cursor.fetchone()
            return user['id'] if user else None
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return None


def get_user_by_telegram_id(telegram_id: int) -> Optional[Dict]:
    """Get user by Telegram ID"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (telegram_id,))
            user = cursor.fetchone()
            return dict(user) if user else None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None


def update_user_direction(telegram_id: int, direction_id: int) -> bool:
    """Update user's direction"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE users SET direction_id = ?, last_active = CURRENT_TIMESTAMP
                WHERE telegram_id = ?
            ''', (direction_id, telegram_id))
            return True
    except Exception as e:
        logger.error(f"Error updating user direction: {e}")
        return False


def update_user_xp(telegram_id: int, xp_points: int) -> bool:
    """Add XP points to user"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE users 
                SET xp_points = xp_points + ?,
                    level = (xp_points + ?) / 100 + 1,
                    last_active = CURRENT_TIMESTAMP
                WHERE telegram_id = ?
            ''', (xp_points, xp_points, telegram_id))
            return True
    except Exception as e:
        logger.error(f"Error updating user XP: {e}")
        return False


def update_user_streak(telegram_id: int) -> int:
    """Update user's daily streak"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT last_active, streak_days FROM users 
                WHERE telegram_id = ?
            ''', (telegram_id,))
            user = cursor.fetchone()
            
            if user:
                last_active = datetime.fromisoformat(user['last_active'])
                today = datetime.now().date()
                last_date = last_active.date()
                
                if (today - last_date).days == 1:
                    # Consecutive day
                    new_streak = user['streak_days'] + 1
                elif (today - last_date).days > 1:
                    # Streak broken
                    new_streak = 1
                else:
                    # Same day
                    new_streak = user['streak_days']
                
                cursor.execute('''
                    UPDATE users 
                    SET streak_days = ?, last_active = CURRENT_TIMESTAMP
                    WHERE telegram_id = ?
                ''', (new_streak, telegram_id))
                
                return new_streak
            return 0
    except Exception as e:
        logger.error(f"Error updating streak: {e}")
        return 0


def get_leaderboard(limit: int = 10) -> List[Dict]:
    """Get top users by XP"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT telegram_id, username, full_name, xp_points, level, streak_days
                FROM users
                WHERE xp_points > 0
                ORDER BY xp_points DESC
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        return []


def get_user_stats(telegram_id: int) -> Optional[Dict]:
    """Get comprehensive user statistics"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            # User info
            cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (telegram_id,))
            user = cursor.fetchone()
            if not user:
                return None
            
            # Completed materials count
            cursor.execute('''
                SELECT COUNT(*) as completed_count
                FROM user_progress
                WHERE user_id = ? AND completed = 1
            ''', (user['id'],))
            completed = cursor.fetchone()['completed_count']
            
            # Total time spent
            cursor.execute('''
                SELECT SUM(time_spent) as total_time
                FROM user_progress
                WHERE user_id = ?
            ''', (user['id'],))
            time_row = cursor.fetchone()
            total_time = time_row['total_time'] or 0
            
            # Achievement count
            cursor.execute('''
                SELECT COUNT(*) as achievement_count
                FROM user_achievements
                WHERE user_id = ?
            ''', (user['id'],))
            achievements = cursor.fetchone()['achievement_count']
            
            return {
                **dict(user),
                'completed_materials': completed,
                'total_time_minutes': total_time // 60,
                'achievements_unlocked': achievements
            }
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        return None


# ==================== DIRECTIONS ====================

def get_all_directions(active_only: bool = True) -> List[Dict]:
    """Get all directions"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM directions'
            if active_only:
                query += ' WHERE is_active = 1'
            query += ' ORDER BY order_index, id'
            
            cursor.execute(query)
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting directions: {e}")
        return []


def create_direction(name: str, description: str = None, icon_url: str = None) -> Optional[int]:
    """Create new direction"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO directions (name, description, icon_url)
                VALUES (?, ?, ?)
            ''', (name, description, icon_url))
            return cursor.lastrowid
    except Exception as e:
        logger.error(f"Error creating direction: {e}")
        return None


def update_direction(direction_id: int, **kwargs) -> bool:
    """Update direction"""
    try:
        fields = []
        values = []
        for key, value in kwargs.items():
            if key in ['name', 'description', 'icon_url', 'order_index', 'is_active']:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
            return False
        
        values.append(direction_id)
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'''
                UPDATE directions SET {', '.join(fields)}
                WHERE id = ?
            ''', values)
            return True
    except Exception as e:
        logger.error(f"Error updating direction: {e}")
        return False


def delete_direction(direction_id: int) -> bool:
    """Delete direction (cascade deletes courses and materials)"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM directions WHERE id = ?', (direction_id,))
            return True
    except Exception as e:
        logger.error(f"Error deleting direction: {e}")
        return False


# ==================== COURSES ====================

def get_courses_by_direction(direction_id: int, active_only: bool = True) -> List[Dict]:
    """Get all courses for a direction"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM courses WHERE direction_id = ?'
            if active_only:
                query += ' AND is_active = 1'
            query += ' ORDER BY order_index, id'
            
            cursor.execute(query, (direction_id,))
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting courses: {e}")
        return []


def get_course_by_id(course_id: int) -> Optional[Dict]:
    """Get course details"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM courses WHERE id = ?', (course_id,))
            course = cursor.fetchone()
            return dict(course) if course else None
    except Exception as e:
        logger.error(f"Error getting course: {e}")
        return None


def create_course(direction_id: int, title: str, language: str, **kwargs) -> Optional[int]:
    """Create new course"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO courses 
                (direction_id, title, language, description, level, duration_hours, 
                 thumbnail_url, order_index)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (direction_id, title, language, 
                  kwargs.get('description'), kwargs.get('level', 'beginner'),
                  kwargs.get('duration_hours', 0), kwargs.get('thumbnail_url'),
                  kwargs.get('order_index', 0)))
            return cursor.lastrowid
    except Exception as e:
        logger.error(f"Error creating course: {e}")
        return None


def update_course(course_id: int, **kwargs) -> bool:
    """Update course"""
    try:
        fields = []
        values = []
        allowed_fields = ['title', 'description', 'level', 'language', 'duration_hours',
                         'thumbnail_url', 'order_index', 'is_active']
        
        for key, value in kwargs.items():
            if key in allowed_fields:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
            return False
        
        values.append(course_id)
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'''
                UPDATE courses SET {', '.join(fields)}
                WHERE id = ?
            ''', values)
            return True
    except Exception as e:
        logger.error(f"Error updating course: {e}")
        return False


def delete_course(course_id: int) -> bool:
    """Delete course"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM courses WHERE id = ?', (course_id,))
            return True
    except Exception as e:
        logger.error(f"Error deleting course: {e}")
        return False


# ==================== MATERIALS ====================

def get_materials_by_course(course_id: int) -> List[Dict]:
    """Get all materials for a course"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM materials 
                WHERE course_id = ?
                ORDER BY order_index, id
            ''', (course_id,))
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting materials: {e}")
        return []


def get_material_by_id(material_id: int) -> Optional[Dict]:
    """Get material details"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM materials WHERE id = ?', (material_id,))
            material = cursor.fetchone()
            return dict(material) if material else None
    except Exception as e:
        logger.error(f"Error getting material: {e}")
        return None


def create_material(course_id: int, title: str, type: str, **kwargs) -> Optional[int]:
    """Create new material"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO materials 
                (course_id, title, type, description, file_id, file_url, 
                 file_size, duration, order_index, is_free, xp_reward)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (course_id, title, type, kwargs.get('description'),
                  kwargs.get('file_id'), kwargs.get('file_url'),
                  kwargs.get('file_size', 0), kwargs.get('duration', 0),
                  kwargs.get('order_index', 0), kwargs.get('is_free', 1),
                  kwargs.get('xp_reward', 10)))
            return cursor.lastrowid
    except Exception as e:
        logger.error(f"Error creating material: {e}")
        return None


def update_material(material_id: int, **kwargs) -> bool:
    """Update material"""
    try:
        fields = []
        values = []
        allowed_fields = ['title', 'description', 'type', 'file_id', 'file_url',
                         'file_size', 'duration', 'order_index', 'is_free', 'xp_reward']
        
        for key, value in kwargs.items():
            if key in allowed_fields:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
            return False
        
        values.append(material_id)
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'''
                UPDATE materials SET {', '.join(fields)}
                WHERE id = ?
            ''', values)
            return True
    except Exception as e:
        logger.error(f"Error updating material: {e}")
        return False


def delete_material(material_id: int) -> bool:
    """Delete material"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM materials WHERE id = ?', (material_id,))
            return True
    except Exception as e:
        logger.error(f"Error deleting material: {e}")
        return False


# ==================== USER PROGRESS ====================

def update_progress(telegram_id: int, material_id: int, progress_percent: int = 0,
                    completed: bool = False, last_position: int = 0, 
                    time_spent: int = 0) -> bool:
    """Update user's progress on a material"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        if not user:
            return False
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO user_progress 
                (user_id, material_id, progress_percent, completed, last_position, time_spent)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, material_id) DO UPDATE SET
                    progress_percent = excluded.progress_percent,
                    completed = excluded.completed,
                    last_position = excluded.last_position,
                    time_spent = time_spent + excluded.time_spent,
                    completed_at = CASE WHEN excluded.completed = 1 
                                   THEN CURRENT_TIMESTAMP ELSE completed_at END,
                    updated_at = CURRENT_TIMESTAMP
            ''', (user['id'], material_id, progress_percent, completed, last_position, time_spent))
            
            # Award XP if completed
            if completed:
                material = get_material_by_id(material_id)
                if material:
                    update_user_xp(telegram_id, material['xp_reward'])
            
            return True
    except Exception as e:
        logger.error(f"Error updating progress: {e}")
        return False


def get_user_progress(telegram_id: int, course_id: int = None) -> List[Dict]:
    """Get user's progress"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        if not user:
            return []
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            if course_id:
                cursor.execute('''
                    SELECT p.*, m.title, m.type, m.course_id
                    FROM user_progress p
                    JOIN materials m ON p.material_id = m.id
                    WHERE p.user_id = ? AND m.course_id = ?
                    ORDER BY m.order_index
                ''', (user['id'], course_id))
            else:
                cursor.execute('''
                    SELECT p.*, m.title, m.type, m.course_id
                    FROM user_progress p
                    JOIN materials m ON p.material_id = m.id
                    WHERE p.user_id = ?
                    ORDER BY p.updated_at DESC
                ''', (user['id'],))
            
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting progress: {e}")
        return []


# ==================== FAVORITES ====================

def add_to_favorites(telegram_id: int, material_id: int) -> bool:
    """Add material to favorites"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        if not user:
            return False
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO favorites (user_id, material_id)
                VALUES (?, ?)
            ''', (user['id'], material_id))
            return True
    except Exception as e:
        logger.error(f"Error adding to favorites: {e}")
        return False


def remove_from_favorites(telegram_id: int, material_id: int) -> bool:
    """Remove material from favorites"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        if not user:
            return False
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                DELETE FROM favorites 
                WHERE user_id = ? AND material_id = ?
            ''', (user['id'], material_id))
            return True
    except Exception as e:
        logger.error(f"Error removing from favorites: {e}")
        return False


def get_user_favorites(telegram_id: int) -> List[Dict]:
    """Get user's favorite materials"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        if not user:
            return []
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT m.*, f.created_at as favorited_at
                FROM favorites f
                JOIN materials m ON f.material_id = m.id
                WHERE f.user_id = ?
                ORDER BY f.created_at DESC
            ''', (user['id'],))
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting favorites: {e}")
        return []


# ==================== ACHIEVEMENTS ====================

def check_and_award_achievements(telegram_id: int) -> List[Dict]:
    """Check and award achievements to user"""
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        return []
    
    awarded = []
    
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            # Get all achievements not yet unlocked
            cursor.execute('''
                SELECT a.* FROM achievements a
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_achievements ua
                    WHERE ua.user_id = ? AND ua.achievement_id = a.id
                )
            ''', (user['id'],))
            
            achievements = cursor.fetchall()
            
            for ach in achievements:
                should_award = False
                
                if ach['condition_type'] == 'complete_first':
                    cursor.execute('''
                        SELECT COUNT(*) as count FROM user_progress
                        WHERE user_id = ? AND completed = 1
                    ''', (user['id'],))
                    count = cursor.fetchone()['count']
                    should_award = count >= 1
                
                elif ach['condition_type'] == 'complete_lessons':
                    cursor.execute('''
                        SELECT COUNT(*) as count FROM user_progress
                        WHERE user_id = ? AND completed = 1
                    ''', (user['id'],))
                    count = cursor.fetchone()['count']
                    should_award = count >= ach['condition_value']
                
                elif ach['condition_type'] == 'streak':
                    should_award = user['streak_days'] >= ach['condition_value']
                
                if should_award:
                    cursor.execute('''
                        INSERT OR IGNORE INTO user_achievements 
                        (user_id, achievement_id)
                        VALUES (?, ?)
                    ''', (user['id'], ach['id']))
                    
                    # Award XP
                    update_user_xp(telegram_id, ach['xp_reward'])
                    
                    awarded.append(dict(ach))
        
        return awarded
    except Exception as e:
        logger.error(f"Error checking achievements: {e}")
        return []


def get_user_achievements(telegram_id: int) -> List[Dict]:
    """Get user's unlocked achievements"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        if not user:
            return []
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT a.*, ua.unlocked_at
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = ?
                ORDER BY ua.unlocked_at DESC
            ''', (user['id'],))
            return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting achievements: {e}")
        return []


# ==================== ANALYTICS ====================

def log_analytics_event(telegram_id: int, event_type: str, event_data: str = None):
    """Log analytics event"""
    try:
        user = get_user_by_telegram_id(telegram_id)
        user_id = user['id'] if user else None
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO analytics_events (user_id, event_type, event_data)
                VALUES (?, ?, ?)
            ''', (user_id, event_type, event_data))
    except Exception as e:
        logger.error(f"Error logging analytics: {e}")


def get_admin_stats() -> Dict:
    """Get statistics for admin dashboard"""
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            # Total users
            cursor.execute('SELECT COUNT(*) as count FROM users')
            total_users = cursor.fetchone()['count']
            
            # Active users (last 7 days)
            cursor.execute('''
                SELECT COUNT(*) as count FROM users
                WHERE date(last_active) >= date('now', '-7 days')
            ''')
            active_users = cursor.fetchone()['count']
            
            # Total materials
            cursor.execute('SELECT COUNT(*) as count FROM materials')
            total_materials = cursor.fetchone()['count']
            
            # Total completions
            cursor.execute('''
                SELECT COUNT(*) as count FROM user_progress WHERE completed = 1
            ''')
            total_completions = cursor.fetchone()['count']
            
            # Popular materials
            cursor.execute('''
                SELECT m.title, COUNT(*) as views
                FROM user_progress p
                JOIN materials m ON p.material_id = m.id
                GROUP BY m.id
                ORDER BY views DESC
                LIMIT 5
            ''')
            popular_materials = [dict(row) for row in cursor.fetchall()]
            
            return {
                'total_users': total_users,
                'active_users_7d': active_users,
                'total_materials': total_materials,
                'total_completions': total_completions,
                'popular_materials': popular_materials
            }
    except Exception as e:
        logger.error(f"Error getting admin stats: {e}")
        return {}
