"""
Database migration script - migrate from old bot database to new mini app database
"""
from app.models.database import db
import sys

if __name__ == "__main__":
    old_db_path = sys.argv[1] if len(sys.argv) > 1 else '../bot_data.db'
    
    print(f"🔄 Starting migration from {old_db_path}")
    
    success = db.migrate_from_old_db(old_db_path)
    
    if success:
        print("✅ Migration completed successfully!")
    else:
        print("❌ Migration failed!")
        sys.exit(1)
