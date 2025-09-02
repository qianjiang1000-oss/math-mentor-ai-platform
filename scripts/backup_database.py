#!/usr/bin/env python3
import sqlite3
import shutil
import datetime
import os
from pathlib import Path

def backup_database():
    db_path = Path("backend/data/math_mentor.db")
    backups_dir = Path("backups")
    backups_dir.mkdir(exist_ok=True)
    
    if db_path.exists():
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = backups_dir / f"math_mentor_backup_{timestamp}.db"
        shutil.copy2(db_path, backup_path)
        print(f"Database backed up to {backup_path}")
    else:
        print("Database file not found.")

if __name__ == "__main__":
    backup_database()