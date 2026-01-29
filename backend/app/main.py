"""
Oriental Mini App - FastAPI Backend
Main application with all API endpoints
"""
from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import hashlib
import hmac
import json
import logging
import os
from urllib.parse import parse_qs

from app.crud import crud
from app.models.database import db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot token from environment variable
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
if not BOT_TOKEN:
    logger.warning("BOT_TOKEN environment variable not set!")

# FastAPI app
app = FastAPI(
    title="Oriental University Mini App API",
    description="Backend API for educational Telegram Mini App",
    version="1.0.0"
)

# CORS middleware - configure allowed origins for production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== AUTHENTICATION ====================

def verify_telegram_web_app_data(init_data: str) -> dict:
    """Verify Telegram Mini App init data"""
    try:
        parsed_data = parse_qs(init_data)
        
        # Extract hash
        received_hash = parsed_data.get('hash', [''])[0]
        if not received_hash:
            raise ValueError("No hash provided")
        
        # Create data check string
        check_items = []
        for key, value in sorted(parsed_data.items()):
            if key != 'hash':
                check_items.append(f"{key}={value[0]}")
        
        data_check_string = '\n'.join(check_items)
        
        # Calculate hash
        secret_key = hmac.new(
            "WebAppData".encode(),
            BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if calculated_hash != received_hash:
            raise ValueError("Invalid hash")
        
        # Parse user data
        user_data = json.loads(parsed_data.get('user', ['{}'])[0])
        
        return user_data
        
    except Exception as e:
        logger.error(f"Telegram auth verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def get_current_user(authorization: str = Header(None)):
    """Dependency to get current user from header"""
    if not authorization or not authorization.startswith("tma "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    init_data = authorization[4:]  # Remove "tma " prefix
    user_data = verify_telegram_web_app_data(init_data)
    
    telegram_id = user_data.get('id')
    if not telegram_id:
        raise HTTPException(status_code=401, detail="Invalid user data")
    
    # Get or create user
    user = crud.get_user_by_telegram_id(telegram_id)
    if not user:
        crud.create_user(
            telegram_id=telegram_id,
            username=user_data.get('username'),
            full_name=user_data.get('first_name', '') + ' ' + user_data.get('last_name', '')
        )
        user = crud.get_user_by_telegram_id(telegram_id)
    
    # Update last active and streak
    crud.update_user_streak(telegram_id)
    
    return user


# ==================== PUBLIC ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check"""
    return {"status": "ok", "message": "Oriental Mini App API"}


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }


# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/login")
async def login(init_data: str):
    """Login or register user via Telegram Mini App"""
    try:
        user_data = verify_telegram_web_app_data(init_data)
        telegram_id = user_data.get('id')
        
        # Get or create user
        user = crud.get_user_by_telegram_id(telegram_id)
        if not user:
            crud.create_user(
                telegram_id=telegram_id,
                username=user_data.get('username'),
                full_name=user_data.get('first_name', '') + ' ' + user_data.get('last_name', '')
            )
            user = crud.get_user_by_telegram_id(telegram_id)
        
        return {"success": True, "user": user}
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    stats = crud.get_user_stats(current_user['telegram_id'])
    return {"success": True, "user": stats}


# ==================== DIRECTIONS ENDPOINTS ====================

@app.get("/api/directions")
async def get_directions(current_user: dict = Depends(get_current_user)):
    """Get all active directions"""
    directions = crud.get_all_directions(active_only=True)
    
    # Add user's progress for each direction
    for direction in directions:
        courses = crud.get_courses_by_direction(direction['id'])
        total_materials = sum(
            len(crud.get_materials_by_course(course['id'])) 
            for course in courses
        )
        
        completed_materials = 0
        for course in courses:
            materials = crud.get_materials_by_course(course['id'])
            for material in materials:
                progress = crud.get_user_progress(
                    current_user['telegram_id'], 
                    course['id']
                )
                completed_materials += sum(
                    1 for p in progress 
                    if p['material_id'] == material['id'] and p['completed']
                )
        
        direction['total_materials'] = total_materials
        direction['completed_materials'] = completed_materials
        direction['progress_percent'] = (
            (completed_materials / total_materials * 100) 
            if total_materials > 0 else 0
        )
    
    return {"success": True, "directions": directions}


@app.get("/api/directions/{direction_id}")
async def get_direction(
    direction_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get direction details"""
    directions = crud.get_all_directions(active_only=False)
    direction = next((d for d in directions if d['id'] == direction_id), None)
    
    if not direction:
        raise HTTPException(status_code=404, detail="Direction not found")
    
    return {"success": True, "direction": direction}


@app.post("/api/directions")
async def create_direction_endpoint(
    name: str,
    description: str = None,
    icon_url: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Create new direction (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    direction_id = crud.create_direction(name, description, icon_url)
    if not direction_id:
        raise HTTPException(status_code=400, detail="Failed to create direction")
    
    return {"success": True, "direction_id": direction_id}


@app.put("/api/directions/{direction_id}")
async def update_direction_endpoint(
    direction_id: int,
    name: str = None,
    description: str = None,
    icon_url: str = None,
    order_index: int = None,
    is_active: bool = None,
    current_user: dict = Depends(get_current_user)
):
    """Update direction (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = {}
    if name is not None:
        update_data['name'] = name
    if description is not None:
        update_data['description'] = description
    if icon_url is not None:
        update_data['icon_url'] = icon_url
    if order_index is not None:
        update_data['order_index'] = order_index
    if is_active is not None:
        update_data['is_active'] = is_active
    
    success = crud.update_direction(direction_id, **update_data)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update direction")
    
    return {"success": True}


@app.delete("/api/directions/{direction_id}")
async def delete_direction_endpoint(
    direction_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete direction (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    success = crud.delete_direction(direction_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete direction")
    
    return {"success": True}


# ==================== COURSES ENDPOINTS ====================

@app.get("/api/courses")
async def get_courses(
    direction_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get courses by direction"""
    courses = crud.get_courses_by_direction(direction_id, active_only=True)
    
    # Add progress info
    for course in courses:
        materials = crud.get_materials_by_course(course['id'])
        progress_list = crud.get_user_progress(
            current_user['telegram_id'],
            course['id']
        )
        
        course['total_materials'] = len(materials)
        course['completed_materials'] = sum(1 for p in progress_list if p['completed'])
        course['progress_percent'] = (
            (course['completed_materials'] / course['total_materials'] * 100)
            if course['total_materials'] > 0 else 0
        )
    
    return {"success": True, "courses": courses}


@app.get("/api/courses/{course_id}")
async def get_course(
    course_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get course details with materials"""
    course = crud.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    materials = crud.get_materials_by_course(course_id)
    progress_list = crud.get_user_progress(current_user['telegram_id'], course_id)
    
    # Add progress to each material
    progress_dict = {p['material_id']: p for p in progress_list}
    for material in materials:
        material['progress'] = progress_dict.get(material['id'], {
            'completed': False,
            'progress_percent': 0,
            'last_position': 0
        })
    
    course['materials'] = materials
    course['total_materials'] = len(materials)
    course['completed_materials'] = sum(1 for p in progress_list if p['completed'])
    
    return {"success": True, "course": course}


@app.post("/api/courses")
async def create_course_endpoint(
    direction_id: int,
    title: str,
    language: str,
    description: str = None,
    level: str = "beginner",
    duration_hours: int = 0,
    thumbnail_url: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Create new course (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    course_id = crud.create_course(
        direction_id, title, language,
        description=description, level=level,
        duration_hours=duration_hours, thumbnail_url=thumbnail_url
    )
    
    if not course_id:
        raise HTTPException(status_code=400, detail="Failed to create course")
    
    return {"success": True, "course_id": course_id}


# ==================== MATERIALS ENDPOINTS ====================

@app.get("/api/materials/{material_id}")
async def get_material(
    material_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get material details"""
    material = crud.get_material_by_id(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Get user's progress
    course = crud.get_course_by_id(material['course_id'])
    progress_list = crud.get_user_progress(
        current_user['telegram_id'],
        course['id']
    )
    
    material_progress = next(
        (p for p in progress_list if p['material_id'] == material_id),
        {'completed': False, 'progress_percent': 0, 'last_position': 0}
    )
    
    material['progress'] = material_progress
    
    # Log view event
    crud.log_analytics_event(
        current_user['telegram_id'],
        'material_view',
        f"material_id:{material_id}"
    )
    
    return {"success": True, "material": material}


@app.post("/api/materials/{material_id}/progress")
async def update_material_progress(
    material_id: int,
    progress_percent: int = 0,
    completed: bool = False,
    last_position: int = 0,
    time_spent: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Update user's progress on a material"""
    success = crud.update_progress(
        current_user['telegram_id'],
        material_id,
        progress_percent=progress_percent,
        completed=completed,
        last_position=last_position,
        time_spent=time_spent
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update progress")
    
    # Check for achievements
    new_achievements = crud.check_and_award_achievements(current_user['telegram_id'])
    
    return {
        "success": True,
        "new_achievements": new_achievements
    }


@app.post("/api/materials")
async def create_material_endpoint(
    course_id: int,
    title: str,
    type: str,
    description: str = None,
    file_id: str = None,
    file_url: str = None,
    duration: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Create new material (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    material_id = crud.create_material(
        course_id, title, type,
        description=description, file_id=file_id,
        file_url=file_url, duration=duration
    )
    
    if not material_id:
        raise HTTPException(status_code=400, detail="Failed to create material")
    
    return {"success": True, "material_id": material_id}


# ==================== USER ENDPOINTS ====================

@app.get("/api/user/progress")
async def get_user_progress_endpoint(
    course_id: int = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's learning progress"""
    progress = crud.get_user_progress(current_user['telegram_id'], course_id)
    return {"success": True, "progress": progress}


@app.put("/api/user/direction")
async def update_user_direction(
    direction_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Update user's selected direction"""
    success = crud.update_user_direction(
        current_user['telegram_id'],
        direction_id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update direction")
    
    return {"success": True}


# ==================== FAVORITES ENDPOINTS ====================

@app.get("/api/favorites")
async def get_favorites(current_user: dict = Depends(get_current_user)):
    """Get user's favorite materials"""
    favorites = crud.get_user_favorites(current_user['telegram_id'])
    return {"success": True, "favorites": favorites}


@app.post("/api/favorites/{material_id}")
async def add_favorite(
    material_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Add material to favorites"""
    success = crud.add_to_favorites(current_user['telegram_id'], material_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add favorite")
    
    return {"success": True}


@app.delete("/api/favorites/{material_id}")
async def remove_favorite(
    material_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Remove material from favorites"""
    success = crud.remove_from_favorites(current_user['telegram_id'], material_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove favorite")
    
    return {"success": True}


# ==================== GAMIFICATION ENDPOINTS ====================

@app.get("/api/leaderboard")
async def get_leaderboard_endpoint(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Get top users leaderboard"""
    leaderboard = crud.get_leaderboard(limit)
    
    # Find current user's position
    user_position = None
    for idx, user in enumerate(leaderboard, 1):
        if user['telegram_id'] == current_user['telegram_id']:
            user_position = idx
            break
    
    return {
        "success": True,
        "leaderboard": leaderboard,
        "user_position": user_position
    }


@app.get("/api/achievements")
async def get_achievements(current_user: dict = Depends(get_current_user)):
    """Get user's achievements"""
    achievements = crud.get_user_achievements(current_user['telegram_id'])
    return {"success": True, "achievements": achievements}


# ==================== ADMIN ENDPOINTS ====================

@app.get("/api/admin/stats")
async def get_admin_stats_endpoint(current_user: dict = Depends(get_current_user)):
    """Get admin dashboard statistics"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = crud.get_admin_stats()
    return {"success": True, "stats": stats}


# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("🚀 Starting Oriental Mini App API...")
    
    # Initialize database
    db.create_tables()
    
    # Seed initial data if needed
    db.seed_initial_data()
    
    logger.info("✅ API started successfully!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
