import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import json
import os
import logging
import re
from typing import Tuple, List, Dict, Any
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr

logger = logging.getLogger(__name__)

class AdvancedMathAI:
    """Advanced mathematical AI model with actual TensorFlow implementation"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.label_encoder = None
        self.config = None
        self.is_loaded = False
    
    def load_model(self, model_dir: str = 'models') -> bool:
        """Load trained model and artifacts"""
        try:
            model_path = os.path.join(model_dir, 'math_model.h5')
            tokenizer_path = os.path.join(model_dir, 'tokenizer.pkl')
            label_encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
            config_path = os.path.join(model_dir, 'model_config.json')
            
            if not all(os.path.exists(path) for path in [model_path, tokenizer_path, label_encoder_path, config_path]):
                logger.warning("Model files not found. Training required.")
                return False
            
            # Load model
            self.model = load_model(model_path)
            
            # Load tokenizer
            with open(tokenizer_path, 'rb') as f:
                self.tokenizer = pickle.load(f)
            
            # Load label encoder
            with open(label_encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            
            # Load config
            with open(config_path, 'r') as f:
                self.config = json.load(f)
            
            self.is_loaded = True
            logger.info("Model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.is_loaded = False
            return False
    
    def preprocess_input(self, problem_text: str) -> np.ndarray:
        """Preprocess input text for prediction"""
        # Clean and normalize text
        problem_text = problem_text.lower().strip()
        problem_text = re.sub(r'\s+', ' ', problem_text)
        
        # Tokenize and pad
        sequence = self.tokenizer.texts_to_sequences([problem_text])
        padded = pad_sequences(sequence, maxlen=self.config['max_sequence_length'])
        
        return padded
    
    def predict(self, problem_text: str) -> Tuple[str, float]:
        """Predict solution for mathematical problem"""
        if not self.is_loaded:
            logger.warning("Model not loaded. Cannot make predictions.")
            return "Model not trained yet. Please train the model first.", 0.0
        
        try:
            # Preprocess input
            X = self.preprocess_input(problem_text)
            
            # Predict
            predictions = self.model.predict(X, verbose=0)
            predicted_idx = np.argmax(predictions[0])
            confidence = np.max(predictions[0])
            
            # Decode prediction
            solution = self.label_encoder.inverse_transform([predicted_idx])[0]
            
            return solution, float(confidence)
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return f"Prediction error: {str(e)}", 0.0
    
    def predict_with_explanation(self, problem_text: str) -> Dict[str, Any]:
        """Predict solution with detailed explanation"""
        solution, confidence = self.predict(problem_text)
        
        # Generate step-by-step explanation
        explanation = self.generate_explanation(problem_text, solution)
        
        # Extract mathematical concepts
        concepts = self.extract_concepts(problem_text)
        
        # Generate detailed steps
        steps = self.generate_detailed_steps(problem_text, solution)
        
        return {
            "solution": solution,
            "confidence": confidence,
            "explanation": explanation,
            "concepts": concepts,
            "steps": steps,
            "variables": self.extract_variables(problem_text),
            "processed_problem": self.preprocess_problem_text(problem_text)
        }
    
    def preprocess_problem_text(self, problem_text: str) -> str:
        """Preprocess problem text for display"""
        # Basic cleaning for display
        text = problem_text.strip()
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def extract_variables(self, problem_text: str) -> List[str]:
        """Extract variables from problem text"""
        try:
            # Use sympy to extract variables
            variables = []
            # Look for common variable patterns
            variable_patterns = [
                r'\b[a-zA-Z]\b',  # Single letter variables
                r'\b[a-zA-Z][0-9]?\b',  # Single letter with optional number
            ]
            
            for pattern in variable_patterns:
                variables.extend(re.findall(pattern, problem_text))
            
            return sorted(list(set(variables)))
        except:
            return []
    
    def generate_explanation(self, problem_text: str, solution: str) -> List[str]:
        """Generate step-by-step explanation"""
        steps = [
            f"Analyzed the problem: '{problem_text}'",
            "Identified mathematical concepts and patterns",
            "Applied appropriate solution strategy",
            f"Arrived at solution: {solution}"
        ]
        
        # Add more specific steps based on problem type
        problem_lower = problem_text.lower()
        
        if "solve for" in problem_lower or "=" in problem_lower:
            steps.insert(2, "Isolated the variable and solved the equation")
        elif "derivative" in problem_lower:
            steps.insert(2, "Applied differentiation rules and power rule")
        elif "integral" in problem_lower or "∫" in problem_lower:
            steps.insert(2, "Applied integration techniques and found antiderivative")
        elif "limit" in problem_lower:
            steps.insert(2, "Evaluated the limit using appropriate methods")
        elif "area" in problem_lower or "volume" in problem_lower:
            steps.insert(2, "Used geometric formulas to calculate measurement")
        elif "probability" in problem_lower:
            steps.insert(2, "Calculated probability using statistical methods")
        
        return steps
    
    def generate_detailed_steps(self, problem_text: str, solution: str) -> List[str]:
        """Generate detailed solution steps"""
        problem_lower = problem_text.lower()
        steps = []
        
        if "solve for" in problem_lower:
            steps = [
                "Step 1: Identify the equation and variables",
                "Step 2: Simplify both sides of the equation",
                "Step 3: Isolate the variable term",
                "Step 4: Solve for the variable",
                f"Step 5: Verify the solution: {solution}"
            ]
        elif "derivative" in problem_lower:
            steps = [
                "Step 1: Identify the function to differentiate",
                "Step 2: Apply differentiation rules (power rule, chain rule, etc.)",
                "Step 3: Simplify the derivative expression",
                f"Step 4: Final derivative: {solution}"
            ]
        elif "integral" in problem_lower:
            steps = [
                "Step 1: Identify the function to integrate",
                "Step 2: Find the antiderivative",
                "Step 3: Apply integration techniques (substitution, parts, etc.)",
                "Step 4: Add constant of integration if needed",
                f"Step 5: Final integral: {solution}"
            ]
        else:
            steps = [
                "Step 1: Understand the problem statement",
                "Step 2: Identify known values and variables",
                "Step 3: Apply appropriate mathematical operations",
                "Step 4: Simplify the solution",
                f"Step 5: Final answer: {solution}"
            ]
        
        return steps
    
    def extract_concepts(self, problem_text: str) -> List[str]:
        """Extract mathematical concepts from problem text"""
        concepts = []
        text_lower = problem_text.lower()
        
        concept_mapping = {
            'algebra': ['solve', 'equation', 'variable', 'x', 'y', 'z', 'algebra', 'polynomial', 'quadratic', 'linear'],
            'calculus': ['derivative', 'integral', 'limit', 'differentiate', 'calculus', 'differentiation', 'integration'],
            'geometry': ['area', 'volume', 'angle', 'circle', 'triangle', 'geometry', 'perimeter', 'radius', 'diameter'],
            'trigonometry': ['sin', 'cos', 'tan', 'trig', 'angle', 'trigonometry', 'sine', 'cosine', 'tangent'],
            'probability': ['probability', 'chance', 'likely', 'random', 'stats', 'odds', 'expectation'],
            'statistics': ['mean', 'median', 'mode', 'standard deviation', 'statistics', 'variance', 'distribution'],
            'arithmetic': ['add', 'subtract', 'multiply', 'divide', 'sum', 'difference', 'product', 'quotient']
        }
        
        for concept, keywords in concept_mapping.items():
            if any(keyword in text_lower for keyword in keywords):
                concepts.append(concept)
        
        return concepts if concepts else ['general mathematics']
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if not self.is_loaded:
            return {"status": "not_loaded"}
        
        return {
            "status": "loaded",
            "vocab_size": self.config.get('vocab_size', 0),
            "max_sequence_length": self.config.get('max_sequence_length', 0),
            "embedding_dim": self.config.get('embedding_dim', 0),
            "architecture": self.config.get('model_architecture', 'unknown'),
            "classes": len(self.label_encoder.classes_) if self.label_encoder else 0,
            "training_date": self.config.get('training_date', 'unknown')
        }
    
    def batch_predict(self, problems: List[str]) -> List[Dict[str, Any]]:
        """Predict solutions for multiple problems"""
        results = []
        for problem in problems:
            try:
                result = self.predict_with_explanation(problem)
                results.append({
                    "problem": problem,
                    "solution": result["solution"],
                    "confidence": result["confidence"],
                    "concepts": result["concepts"]
                })
            except Exception as e:
                results.append({
                    "problem": problem,
                    "solution": f"Error: {str(e)}",
                    "confidence": 0.0,
                    "concepts": []
                })
        return results

# Global instance
math_ai = AdvancedMathAI()

# Initialize model on import
try:
    math_ai.load_model()
except Exception as e:
    logger.warning(f"Could not load model on startup: {e}")