-- Create tables for Math Mentor AI Platform
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS math_problems (
    id SERIAL PRIMARY KEY,
    problem_text TEXT NOT NULL,
    solution_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    problems_solved INTEGER DEFAULT 0,
    accuracy_rate FLOAT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message_text TEXT NOT NULL,
    is_from_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_math_problems_category ON math_problems(category);
CREATE INDEX IF NOT EXISTS idx_math_problems_difficulty ON math_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Insert initial admin user (password: admin123 - change this in production!)
INSERT INTO users (username, email, password_hash, is_admin)
VALUES ('admin', 'admin@mathmentor.com', 'pbkdf2:sha256:260000$Xc...', TRUE)
ON CONFLICT (username) DO NOTHING;