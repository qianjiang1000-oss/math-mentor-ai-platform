import os
import sqlite3
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        self.connection = None
        
    def get_connection(self):
        """Get database connection based on DATABASE_URL"""
        if self.database_url and self.database_url.startswith('postgresql://'):
            # Parse PostgreSQL URL
            result = urlparse(self.database_url)
            conn = psycopg2.connect(
                database=result.path[1:],
                user=result.username,
                password=result.password,
                host=result.hostname,
                port=result.port
            )
            return conn
        else:
            # SQLite fallback
            db_path = self.database_url.replace('sqlite:///', '') if self.database_url else 'math_tutor.db'
            return sqlite3.connect(db_path)
    
    def execute_query(self, query, params=None):
        """Execute a query and return results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
                
            if query.strip().lower().startswith('select'):
                result = cursor.fetchall()
                # Convert to list of dicts for PostgreSQL
                if self.database_url and self.database_url.startswith('postgresql://'):
                    columns = [desc[0] for desc in cursor.description]
                    return [dict(zip(columns, row)) for row in result]
                return result
            else:
                conn.commit()
                return cursor.lastrowid
                
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()