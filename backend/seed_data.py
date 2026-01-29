"""
Seed initial test data
"""
from app.models.database import db
from app.crud import crud

def seed_test_data():
    print("🌱 Seeding test data...")
    
    # Create test directions
    direction_id = crud.create_direction(
        "Test Yo'nalish",
        "Test uchun yo'nalish",
        "🎓"
    )
    
    if direction_id:
        # Create test course
        course_id = crud.create_course(
            direction_id,
            "Test Kurs - English",
            "english",
            description="Test uchun kurs",
            level="beginner"
        )
        
        if course_id:
            # Create test materials
            crud.create_material(
                course_id,
                "Test Dars 1",
                "video",
                description="Birinchi test darsi"
            )
            
            crud.create_material(
                course_id,
                "Test Dars 2",
                "audio",
                description="Ikkinchi test darsi"
            )
            
            print("✅ Test data seeded successfully!")
    
if __name__ == "__main__":
    db.seed_initial_data()
    seed_test_data()
