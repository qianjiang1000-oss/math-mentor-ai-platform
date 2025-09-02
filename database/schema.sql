-- Math Mentor AI Database Schema
-- Version: 2.0.0

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    topic TEXT NOT NULL,
    solution_steps TEXT,
    final_answer TEXT NOT NULL,
    created_by TEXT DEFAULT 'System',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    mathematical_concepts TEXT
);

-- Training data table
CREATE TABLE IF NOT EXISTS training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_text TEXT NOT NULL,
    solution_text TEXT NOT NULL,
    step_by_step_explanation TEXT,
    mathematical_concepts TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK(difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    contributed_by TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    validation_status TEXT DEFAULT 'pending' CHECK(validation_status IN ('pending', 'approved', 'rejected')),
    used_in_training BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    problem_text TEXT NOT NULL,
    predicted_solution TEXT NOT NULL,
    correct_solution TEXT,
    feedback_type TEXT NOT NULL CHECK(feedback_type IN ('correct', 'incorrect', 'partial')),
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    version TEXT NOT NULL,
    accuracy REAL,
    training_size INTEGER,
    training_duration REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE
);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    training_id TEXT NOT NULL,
    epoch INTEGER,
    accuracy REAL,
    loss REAL,
    val_accuracy REAL,
    val_loss REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Solution requests table
CREATE TABLE IF NOT EXISTS solution_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    problem_text TEXT NOT NULL,
    solution_data TEXT NOT NULL,
    processing_time REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Model metrics table
CREATE TABLE IF NOT EXISTS model_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_version TEXT NOT NULL,
    test_accuracy REAL,
    precision REAL,
    recall REAL,
    f1_score REAL,
    inference_time REAL,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_training_data_status ON training_data(validation_status);
CREATE INDEX IF NOT EXISTS idx_training_data_used ON training_data(used_in_training);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewed ON feedback(reviewed);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_requests_user ON solution_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_requests_date ON solution_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_training_progress_id ON training_progress(training_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(is_active);

-- Insert sample problems
INSERT INTO problems (title, description, difficulty, topic, solution_steps, final_answer, verified, mathematical_concepts)
VALUES 
('Linear Equation Solution', 'Solve for x: 2x + 5 = 15', 'Beginner', 'Algebra', 
'["Subtract 5 from both sides: 2x = 10", "Divide both sides by 2: x = 5"]', 
'x = 5', TRUE, '["algebra", "linear equations"]'),

('Quadratic Equation', 'Solve the quadratic equation: x² - 5x + 6 = 0', 'Intermediate', 'Algebra', 
'["Factor the equation: (x-2)(x-3) = 0", "Set each factor equal to zero: x-2=0 or x-3=0", "Solve for x: x=2 or x=3"]', 
'x = 2 or x = 3', TRUE, '["algebra", "quadratic equations"]'),

('Circle Area Calculation', 'Find the area of a circle with radius 7 units', 'Beginner', 'Geometry', 
'["Use the area formula: A = πr²", "Substitute r = 7: A = π(7)²", "Calculate: A = 49π", "Approximate: A ≈ 153.94 square units"]', 
'A = 49π ≈ 153.94 square units', TRUE, '["geometry", "circle", "area"]'),

('Derivative Calculation', 'Find the derivative of f(x) = 3x² + 2x - 5', 'Intermediate', 'Calculus', 
'["Apply power rule to each term", "Derivative of 3x² is 6x", "Derivative of 2x is 2", "Derivative of constant -5 is 0", "Combine results: f''(x) = 6x + 2"]', 
'f''(x) = 6x + 2', TRUE, '["calculus", "derivatives"]'),

('Probability Calculation', 'What is the probability of rolling a sum of 7 with two fair six-sided dice?', 'Intermediate', 'Probability', 
'["Total possible outcomes: 6 × 6 = 36", "Favorable outcomes for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 outcomes", "Probability = favorable outcomes / total outcomes = 6/36", "Simplify: 1/6"]', 
'1/6', TRUE, '["probability", "statistics"]');

-- Insert sample training data
INSERT INTO training_data (problem_text, solution_text, step_by_step_explanation, mathematical_concepts, difficulty_level, contributed_by, validation_status)
VALUES 
('Solve for x: 3x - 7 = 14', 'x = 7', 
'Add 7 to both sides: 3x = 21. Then divide both sides by 3: x = 7.', 
'["algebra", "linear equations"]', 'Beginner', 'System', 'approved'),

('Find the perimeter of a rectangle with length 8 and width 5', '26 units', 
'Perimeter formula: P = 2(length + width) = 2(8 + 5) = 2 × 13 = 26 units.', 
'["geometry", "perimeter"]', 'Beginner', 'System', 'approved'),

('Calculate the derivative of f(x) = x³ + 4x² - 3x + 2', 'f''(x) = 3x² + 8x - 3', 
'Apply the power rule to each term: derivative of x³ is 3x², derivative of 4x² is 8x, derivative of -3x is -3, derivative of constant 2 is 0.', 
'["calculus", "derivatives"]', 'Intermediate', 'System', 'approved'),

('Solve the quadratic equation: x² - 4x + 4 = 0', 'x = 2', 
'Factor the equation: (x-2)(x-2) = 0. So x-2 = 0, therefore x = 2.', 
'["algebra", "quadratic equations"]', 'Beginner', 'System', 'approved'),

('Find the area of a triangle with base 6 and height 4', '12 square units', 
'Area formula: A = 1/2 × base × height = 1/2 × 6 × 4 = 12 square units.', 
'["geometry", "area"]', 'Beginner', 'System', 'approved');

-- Insert default AI model record
INSERT INTO ai_models (model_name, version, accuracy, training_size, training_duration, is_active)
VALUES ('math_solver', '1.0.0', 0.85, 100, 300.5, TRUE);

-- Create trigger to update last_login
CREATE TRIGGER IF NOT EXISTS update_last_login
AFTER INSERT ON solution_requests
FOR EACH ROW
WHEN NEW.user_id IS NOT NULL
BEGIN
    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
END;

-- Create view for active training data
CREATE VIEW IF NOT EXISTS active_training_data AS
SELECT * FROM training_data 
WHERE validation_status = 'approved' AND used_in_training = FALSE;

-- Create view for user activity
CREATE VIEW IF NOT EXISTS user_activity AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.created_at,
    u.last_login,
    COUNT(sr.id) as solutions_requested,
    COUNT(DISTINCT td.id) as training_data_contributed
FROM users u
LEFT JOIN solution_requests sr ON u.id = sr.user_id
LEFT JOIN training_data td ON u.id = td.user_id
GROUP BY u.id;

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, created_at, is_active)
VALUES ('admin', 'admin@mathmentor.ai', '$2b$12$K9W3q6Q8zR5vT7yX2w1ZeuYJkLmNpQrS1tU4vW5x7y8z9A0B1C2D3', CURRENT_TIMESTAMP, TRUE);