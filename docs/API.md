# Math Mentor AI API Documentation

## Base URL
`https://api.mathmentor.ai/api` (production)  
`http://localhost:5000/api` (development)

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>

Response Format

All responses are in JSON format:
json

{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

Error Responses
400 Bad Request
json

{
  "error": "Missing required field: problem",
  "success": false
}

401 Unauthorized
json

{
  "error": "Token is invalid",
  "success": false
}

500 Internal Server Error
json

{
  "error": "Internal server error",
  "success": false
}

Rate Limiting

    100 requests per hour per IP

    10 training submissions per day per user

Endpoints
Authentication
Register User
http

POST /api/auth/register

Request Body:
json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
json

{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}

Login User
http

POST /api/auth/login

Request Body:
json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: Same as register response.
Health Check
Get Service Status
http

GET /api/health

Response:
json

{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "2.0.0",
  "services": {
    "database": "connected",
    "model": "ready",
    "websocket": "connected"
  },
  "model_info": {
    "status": "loaded",
    "vocab_size": 10000,
    "classes": 150,
    "architecture": "Bidirectional_LSTM"
  }
}

Problem Solving
Solve Mathematical Problem
http

POST /api/solve

Request Body:
json

{
  "problem": "Solve for x: 2x + 5 = 15"
}

Response:
json

{
  "success": true,
  "solution": {
    "steps": [
      "Subtract 5 from both sides: 2x = 10",
      "Divide both sides by 2: x = 5"
    ],
    "final_answer": "x = 5",
    "concepts": ["algebra", "linear equations"],
    "confidence": 0.92,
    "processing_time": 0.125
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "model_version": "2.0.0",
    "model_loaded": true
  }
}

Training Data
Add Training Data
http

POST /api/train

Request Body:
json

{
  "problem_text": "Solve for x: 3x - 7 = 14",
  "solution_text": "x = 7",
  "step_by_step_explanation": "Add 7 to both sides: 3x = 21. Then divide by 3: x = 7.",
  "mathematical_concepts": ["algebra", "linear equations"],
  "difficulty_level": "Beginner",
  "contributed_by": "John Doe"
}

Response:
json

{
  "success": true,
  "message": "Training data added successfully",
  "id": 123
}

Get Training Data
http

GET /api/training-data?page=1&limit=20

Response:
json

{
  "data": [
    {
      "id": 1,
      "problem_text": "Solve for x: 3x - 7 = 14",
      "solution_text": "x = 7",
      "mathematical_concepts": ["algebra", "linear equations"],
      "difficulty_level": "Beginner",
      "contributed_by": "John Doe",
      "created_at": "2024-01-15T10:30:00.000Z",
      "validation_status": "approved"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}

Model Training
Start Model Training
http

POST /api/retrain

Response:
json

{
  "success": true,
  "message": "Model training started",
  "training_id": "train_12345"
}

Get Training Status
http

GET /api/training/status

Response:
json

{
  "is_training": true,
  "progress": 45.5,
  "message": "Epoch 25/50 completed",
  "training_id": "train_12345"
}

Feedback
Submit Feedback
http

POST /api/feedback

Request Body:
json

{
  "problem_text": "Solve for x: 2x + 5 = 15",
  "predicted_solution": "x = 4",
  "correct_solution": "x = 5",
  "feedback_type": "incorrect",
  "comments": "The solution should be x=5"
}

Response:
json

{
  "success": true,
  "message": "Feedback submitted successfully",
  "id": 456
}

WebSocket Events
Connection
javascript

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

Events

Training Events:

    training_started: Training process started

    training_progress: Training progress update

    training_completed: Training completed successfully

    training_failed: Training failed

Chat Events:

    chat_message: Send chat message to AI

    chat_response: Receive AI response

    chat_error: Chat error occurred

Data Types
Timestamps

ISO 8601 format: YYYY-MM-DDTHH:MM:SS.sssZ
Mathematical Concepts

Array of strings representing mathematical domains:
json

["algebra", "calculus", "geometry", "probability"]

Difficulty Levels

    Beginner

    Intermediate

    Advanced

Examples
Python Client
python

import requests

class MathMentorClient:
    def __init__(self, base_url="http://localhost:5000/api"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f"{self.base_url}/auth/login", json={
            "email": email,
            "password": password
        })
        data = response.json()
        if data['success']:
            self.token = data['token']
        return data
    
    def solve_problem(self, problem_text):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/solve", json={
            "problem": problem_text
        }, headers=headers)
        return response.json()

# Usage
client = MathMentorClient()
client.login("john@example.com", "password123")
result = client.solve_problem("Solve for x: 2x + 5 = 15")
print(result['solution']['final_answer'])

JavaScript Client
javascript

const API_BASE = 'http://localhost:5000/api';

async function solveProblem(problem, token) {
  const response = await fetch(`${API_BASE}/solve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ problem })
  });
  return response.json();
}

Versioning

API version is included in the health check response. Breaking changes will increment the major version.
Support

For API issues:

    Check this documentation

    Review error responses

    Check server logs

    Create GitHub issue

Changelog
v2.0.0

    Added WebSocket support for real-time communication

    Enhanced training data management

    Improved error handling

    Added user authentication

    Added solution history tracking

v1.0.0

    Initial API release

    Basic problem solving

    Training data submission

    Model training endpoints