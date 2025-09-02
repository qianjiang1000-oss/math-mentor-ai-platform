#!/usr/bin/env python3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def init_database():
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cursor = conn.cursor()
        
        # Read and execute SQL file
        with open('database/init.sql', 'r') as sql_file:
            sql_commands = sql_file.read()
            cursor.execute(sql_commands)
        
        conn.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_database()