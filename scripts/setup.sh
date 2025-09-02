#!/bin/bash
# Math Mentor AI Setup Script for Linux/Mac

set -e

echo "🚀 Setting up Math Mentor AI..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
if [[ $(echo "$PYTHON_VERSION < 3.8" | bc -l) -eq 1 ]]; then
    print_error "Python 3.8 or higher is required. Found Python $PYTHON_VERSION"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [[ $NODE_MAJOR -lt 16 ]]; then
    print_error "Node.js 16 or higher is required. Found Node.js $NODE_VERSION"
    exit 1
fi

print_status "Found Python $PYTHON_VERSION"
print_status "Found Node.js $NODE_VERSION"

# Create necessary directories
mkdir -p ../logs ../backups ../database
print_status "Created necessary directories"

# Create virtual environment
echo "📦 Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r ../backend/requirements.txt
print_status "Python dependencies installed"

# Initialize database
echo "🗄️ Initializing database..."
cd ../database
if python init_database.py; then
    print_status "Database initialized successfully"
else
    print_error "Database initialization failed"
    exit 1
fi
cd ../scripts

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../frontend
if npm install; then
    print_status "Node.js dependencies installed"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi
cd ../scripts

# Create environment files
echo "⚙️ Creating environment files..."
cd ..

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cat > backend/.env << EOL
# Flask Configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=math-mentor-ai-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production

# Database
DATABASE_URL=sqlite:///../database/math_tutor.db

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Model Configuration
MODEL_PATH=./models
VOCAB_SIZE=10000
MAX_SEQUENCE_LENGTH=128
EMBEDDING_DIM=128

# Training
TRAINING_EPOCHS=100
BATCH_SIZE=32
VALIDATION_SPLIT=0.2
EOL
    print_status "Backend environment file created"
else
    print_warning "Backend environment file already exists"
fi

# Create frontend .env if it doesn't exist
if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
REACT_APP_VERSION=2.0.0
GENERATE_SOURCEMAP=false
EOL
    print_status "Frontend environment file created"
else
    print_warning "Frontend environment file already exists"
fi

cd scripts

print_status "✅ Setup completed successfully!"
echo ""
echo "🎉 Everything is ready! Next steps:"
echo ""
echo "1. Activate virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "2. Start the backend server:"
echo "   cd ../backend && python app.py"
echo ""
echo "3. Start the frontend development server:"
echo "   cd ../frontend && npm start"
echo ""
echo "4. Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "5. Login with default credentials:"
echo "   Email: admin@mathmentor.ai"
echo "   Password: admin123"
echo ""
echo "For production deployment, see docs/DEPLOYMENT.md"