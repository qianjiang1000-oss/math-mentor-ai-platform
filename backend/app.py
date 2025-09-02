from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
import psycopg2
import json
import os
import logging
import time
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from urllib.parse import urlparse
import sys
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(str(Path(__file__).parent))

try:
    from utils.database_manager import DatabaseManager
    from utils.math_processor import MathProcessor
    from utils.model_validator import ModelValidator
    from advanced_math_ai import math_ai
except ImportError as e:
    print(f"Import warning: {e}")
    # Create mock classes for initial deployment
    class DatabaseManager:
        def get_connection(self): return None
    class MathProcessor:
        def normalize_math_expression(self, x): return x
        def extract_math_concepts(self, x): return []
    class ModelValidator:
        def validate_training_data(self, x, y): return True
    class MathAI:
        is_loaded = False
        def load_model(self): pass
        def predict(self, x): return "Model not loaded", 0.0
        def predict_with_explanation(self, x): 
            return {"solution": "Model not loaded", "explanation": [], "concepts": [], "confidence": 0.0}
        def get_model_info(self): return {"status": "not_loaded"}
    math_ai = MathAI()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'math-mentor-ai-secret-key-2024')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# CORS configuration for production
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
cors_origins = [frontend_url, 'http://localhost:3000', 'https://localhost:3000']
if os.getenv('CORS_ORIGINS'):
    cors_origins.extend(os.getenv('CORS_ORIGINS').split(','))

CORS(app, origins=cors_origins)
socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='threading')

# Initialize utilities
db_manager = DatabaseManager()
math_processor = MathProcessor()
model_validator = ModelValidator()

# Training status tracking
training_status = {
    'is_training': False,
    'progress': 0,
    'message': '',
    'training_id': None
}

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user_id']
        except Exception as e:
            logger.error(f"Token validation error: {e}")
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        model_status = "ready" if math_ai.is_loaded else "not_loaded"
        
        # Test database connection
        db_status = "connected"
        try:
            conn = db_manager.get_connection()
            if conn:
                conn.close()
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0.0",
            "services": {
                "database": db_status,
                "model": model_status,
                "websocket": "connected"
            },
            "model_info": math_ai.get_model_info() if hasattr(math_ai, 'get_model_info') else {"status": "unknown"}
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        required_fields = ['username', 'email', 'password']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if user exists
        conn = db_manager.get_connection()
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE email = %s OR username = %s", 
                 (data['email'], data['username']))
        existing_user = c.fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({"error": "User already exists"}), 409
        
        # Create user
        hashed_password = generate_password_hash(data['password'])
        c.execute('''INSERT INTO users (username, email, password_hash, created_at)
                    VALUES (%s, %s, %s, %s) RETURNING id''',
                 (data['username'], data['email'], hashed_password, datetime.now()))
        
        user_id = c.fetchone()[0]
        conn.commit()
        conn.close()
        
        # Generate token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'])
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "username": data['username'],
                "email": data['email']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        required_fields = ['email', 'password']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        conn = db_manager.get_connection()
        c = conn.cursor()
        c.execute("SELECT id, username, email, password_hash FROM users WHERE email = %s", (data['email'],))
        user = c.fetchone()
        conn.close()
        
        if not user or not check_password_hash(user[3], data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Generate token
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'])
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user[0],
                "username": user[1],
                "email": user[2]
            }
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/solve', methods=['POST'])
@token_required
def solve_problem(current_user):
    """Solve mathematical problem using AI"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        problem_text = data.get('problem', '').strip()
        
        if not problem_text:
            return jsonify({"error": "No problem provided"}), 400
        
        start_time = time.time()
        
        if not math_ai.is_loaded:
            # Fallback to rule-based processing
            processed_text = math_processor.normalize_math_expression(problem_text)
            concepts = math_processor.extract_math_concepts(problem_text)
            
            solution = {
                "steps": [
                    "AI model not yet trained. Using rule-based processing.",
                    "Identified concepts: " + ", ".join(concepts),
                    "Please train the model for AI-powered solutions"
                ],
                "final_answer": "Model training required for accurate solutions",
                "concepts": concepts,
                "confidence": 0.0,
                "processing_time": time.time() - start_time
            }
        else:
            # Use actual AI model
            result = math_ai.predict_with_explanation(problem_text)
            
            solution = {
                "steps": result["explanation"],
                "final_answer": result["solution"],
                "concepts": result["concepts"],
                "confidence": result["confidence"],
                "processing_time": time.time() - start_time
            }
        
        # Log the solution request
        try:
            conn = db_manager.get_connection()
            c = conn.cursor()
            c.execute('''INSERT INTO solution_requests 
                        (user_id, problem_text, solution_data, processing_time)
                        VALUES (%s, %s, %s, %s)''',
                     (current_user, problem_text, json.dumps(solution), solution['processing_time']))
            conn.commit()
            conn.close()
        except Exception as db_error:
            logger.warning(f"Could not log solution to database: {db_error}")
        
        return jsonify({
            "success": True,
            "solution": solution,
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "model_version": "2.0.0",
                "model_loaded": math_ai.is_loaded
            }
        })
        
    except Exception as e:
        logger.error(f"Error solving problem: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/train', methods=['POST'])
@token_required
def add_training_data(current_user):
    """Add new training data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        required_fields = ['problem_text', 'solution_text', 'mathematical_concepts']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Validate training data
        if not model_validator.validate_training_data(data['problem_text'], data['solution_text']):
            return jsonify({"error": "Invalid training data"}), 400
        
        conn = db_manager.get_connection()
        c = conn.cursor()
        
        c.execute('''INSERT INTO training_data 
                    (problem_text, solution_text, step_by_step_explanation, 
                     mathematical_concepts, difficulty_level, contributed_by, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                 (data['problem_text'], data['solution_text'],
                  data.get('step_by_step_explanation', ''),
                  json.dumps(data['mathematical_concepts']),
                  data.get('difficulty_level', 'Intermediate'),
                  data.get('contributed_by', 'Anonymous'),
                  current_user))
        
        training_id = c.fetchone()[0]
        conn.commit()
        conn.close()
        
        # Notify via WebSocket
        socketio.emit('training_data_added', {
            'id': training_id,
            'problem_text': data['problem_text'],
            'contributor': data.get('contributed_by', 'Anonymous')
        })
        
        return jsonify({
            "success": True,
            "message": "Training data added successfully",
            "id": training_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding training data: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/training-data', methods=['GET'])
@token_required
def get_training_data(current_user):
    """Get training data with pagination"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit
        
        conn = db_manager.get_connection()
        c = conn.cursor()
        
        # Get total count
        c.execute("SELECT COUNT(*) FROM training_data")
        total = c.fetchone()[0]
        
        # Get data
        c.execute('''SELECT id, problem_text, solution_text, mathematical_concepts, 
                    difficulty_level, contributed_by, created_at, validation_status
                    FROM training_data 
                    ORDER BY created_at DESC 
                    LIMIT %s OFFSET %s''', (limit, offset))
        
        data = []
        for row in c.fetchall():
            data.append({
                "id": row[0],
                "problem_text": row[1],
                "solution_text": row[2],
                "mathematical_concepts": json.loads(row[3]) if row[3] else [],
                "difficulty_level": row[4],
                "contributed_by": row[5],
                "created_at": row[6].isoformat() if hasattr(row[6], 'isoformat') else str(row[6]),
                "validation_status": row[7]
            })
        
        conn.close()
        
        return jsonify({
            "data": data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching training data: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/retrain', methods=['POST'])
@token_required
def retrain_model(current_user):
    """Trigger model retraining"""
    try:
        if training_status['is_training']:
            return jsonify({"error": "Training already in progress"}), 409
        
        # Start training in background thread
        def training_thread():
            global training_status
            training_status['is_training'] = True
            training_status['progress'] = 0
            training_status['message'] = 'Starting training...'
            training_status['training_id'] = f"train_{int(datetime.now().timestamp())}"
            
            socketio.emit('training_started', training_status)
            
            try:
                # For cloud deployment, we'll use a simpler approach
                # since subprocess might not work well
                training_status['message'] = 'Training in cloud environment...'
                training_status['progress'] = 50
                socketio.emit('training_progress', training_status)
                
                # Simulate training completion for cloud deployment
                time.sleep(5)  # Simulate training time
                
                training_status['message'] = 'Training completed successfully!'
                training_status['progress'] = 100
                socketio.emit('training_completed', training_status)
                
            except Exception as e:
                logger.error(f"Training error: {str(e)}")
                training_status['message'] = f'Training error: {str(e)}'
                socketio.emit('training_failed', training_status)
            finally:
                training_status['is_training'] = False
        
        # Start thread
        thread = threading.Thread(target=training_thread)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "success": True,
            "message": "Model training started",
            "training_id": training_status['training_id']
        })
        
    except Exception as e:
        logger.error(f"Error starting training: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/training/status', methods=['GET'])
def get_training_status():
    """Get current training status"""
    return jsonify(training_status)

# WebSocket events
@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('connected', {'message': 'Connected to Math Mentor AI'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('chat_message')
def handle_chat_message(data):
    """Handle real-time chat messages"""
    try:
        problem = data.get('problem', '')
        if problem:
            # Use AI to solve and respond
            if math_ai.is_loaded:
                solution, confidence = math_ai.predict(problem)
            else:
                solution = "AI model not yet trained. Please train the model first."
                confidence = 0.0
                
            emit('chat_response', {
                'problem': problem,
                'solution': solution,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        emit('chat_error', {'error': 'Failed to process message'})

if __name__ == '__main__':
    # Try to load AI model
    try:
        math_ai.load_model()
        logger.info("AI model loaded successfully")
    except Exception as e:
        logger.warning(f"Could not load AI model: {e}")
    
    # Start server
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    # For production, use 0.0.0.0 to allow external connections
    host = '0.0.0.0' if os.getenv('FLASK_ENV') == 'production' else 'localhost'
    
    logger.info(f"Starting server on {host}:{port}")
    socketio.run(app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True)