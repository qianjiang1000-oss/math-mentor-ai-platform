"""
Model validation and quality control utilities
"""

import re
from typing import Dict, List, Tuple
import logging
import numpy as np

logger = logging.getLogger(__name__)

class ModelValidator:
    """Validate model predictions and training data"""
    
    @staticmethod
    def validate_training_data(problem: str, solution: str) -> Tuple[bool, List[str]]:
        """Validate training data quality and return issues"""
        issues = []
        
        if not problem or not solution:
            issues.append("Problem or solution text is empty")
            return False, issues
        
        # Minimum length requirements
        if len(problem.strip()) < 10:
            issues.append("Problem text is too short (minimum 10 characters)")
        
        if len(solution.strip()) < 5:
            issues.append("Solution text is too short (minimum 5 characters)")
        
        # Check for mathematical content in problem
        math_keywords = ['solve', 'calculate', 'find', 'derivative', 'integral', 'equation', 'proof', 'theorem']
        if not any(keyword in problem.lower() for keyword in math_keywords):
            issues.append("Problem doesn't appear to be mathematical")
        
        # Check for obvious errors
        error_patterns = [
            r'undefined',
            r'error',
            r'cannot',
            r'http[s]?://',  # URLs
            r'@[a-zA-Z0-9_]+',  # Mentions
            r'#\w+',  # Hashtags
        ]
        
        problem_errors = [pattern for pattern in error_patterns if re.search(pattern, problem, re.IGNORECASE)]
        solution_errors = [pattern for pattern in error_patterns if re.search(pattern, solution, re.IGNORECASE)]
        
        if problem_errors:
            issues.append(f"Problem contains invalid patterns: {', '.join(problem_errors)}")
        
        if solution_errors:
            issues.append(f"Solution contains invalid patterns: {', '.join(solution_errors)}")
        
        # Check for placeholder text
        placeholders = ['your solution here', 'answer', 'fill in', 'todo', 'xxx']
        if any(placeholder in solution.lower() for placeholder in placeholders):
            issues.append("Solution appears to contain placeholder text")
        
        # Check if solution seems too simple for the problem
        if len(solution.split()) < 3 and len(problem.split()) > 10:
            issues.append("Solution seems too brief for the complexity of the problem")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_prediction(problem: str, prediction: str, confidence: float) -> Dict:
        """Validate model prediction quality"""
        validation = {
            "valid": True,
            "confidence": confidence,
            "issues": [],
            "warnings": [],
            "suggestions": []
        }
        
        # Confidence threshold
        if confidence < 0.3:
            validation["valid"] = False
            validation["issues"].append("Low confidence score (below 0.3)")
        elif confidence < 0.6:
            validation["warnings"].append("Moderate confidence score (below 0.6)")
        
        # Check prediction length
        if not prediction or len(prediction.strip()) < 3:
            validation["valid"] = False
            validation["issues"].append("Prediction too short or empty")
        
        # Check for error patterns
        error_patterns = [
            r'undefined',
            r'error',
            r'cannot',
            r'nan',
            r'infinity',
            r'null',
            r'none',
        ]
        
        for pattern in error_patterns:
            if re.search(pattern, prediction, re.IGNORECASE):
                validation["valid"] = False
                validation["issues"].append(f"Contains {pattern}")
                break
        
        # Check mathematical consistency
        problem_numbers = set(re.findall(r'\d+\.?\d*', problem))
        prediction_numbers = set(re.findall(r'\d+\.?\d*', prediction))
        
        if problem_numbers and not prediction_numbers.intersection(problem_numbers):
            validation["suggestions"].append("Prediction may not use numbers from the problem")
        
        # Check for variables consistency
        problem_vars = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9]*\b', problem))
        prediction_vars = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9]*\b', prediction))
        
        if problem_vars and not prediction_vars.intersection(problem_vars):
            validation["suggestions"].append("Prediction may not use variables from the problem")
        
        # Check if prediction seems like a copy of the problem
        if prediction.lower() in problem.lower() or problem.lower() in prediction.lower():
            validation["warnings"].append("Prediction closely resembles the problem statement")
        
        return validation
    
    @staticmethod
    def calculate_confidence(problem: str, solution: str) -> float:
        """Calculate confidence score for a solution"""
        confidence = 1.0
        
        # Length-based confidence
        solution_length = len(solution.strip())
        if solution_length < 10:
            confidence *= 0.7
        elif solution_length > 200:
            confidence *= 0.9
        elif solution_length > 500:
            confidence *= 0.8
        
        # Mathematical notation confidence
        math_notation = re.findall(r'[a-zA-Z]{2,}', solution)
        if len(math_notation) > 3:
            confidence *= 0.9
        
        # Number presence confidence
        has_numbers = bool(re.search(r'\d', solution))
        if has_numbers:
            confidence *= 1.1  # Boost confidence if numbers are present
        
        # Equation presence confidence
        has_equations = bool(re.search(r'[=\+\-\*\/]', solution))
        if has_equations:
            confidence *= 1.05  # Small boost for equations
        
        # Ensure confidence is within bounds
        confidence = max(0.0, min(1.0, confidence))
        
        return round(confidence, 2)
    
    @staticmethod
    def validate_mathematical_correctness(problem: str, solution: str) -> Tuple[bool, List[str]]:
        """Basic validation of mathematical correctness"""
        issues = []
        
        # Check if solution contains common mathematical errors
        common_errors = [
            (r'\/\s*0', "Division by zero"),
            (r'[0-9]+\s*\/\s*[0-9]+\s*\/', "Double division"),
            (r'[a-zA-Z][0-9]+', "Variable followed immediately by number without operator"),
        ]
        
        for pattern, error_msg in common_errors:
            if re.search(pattern, solution):
                issues.append(error_msg)
        
        # Check if solution seems to answer the problem
        problem_keywords = re.findall(r'\b[a-zA-Z]{4,}\b', problem.lower())
        solution_keywords = re.findall(r'\b[a-zA-Z]{4,}\b', solution.lower())
        
        matching_keywords = set(problem_keywords) & set(solution_keywords)
        if len(matching_keywords) < 2 and len(problem_keywords) > 3:
            issues.append("Solution may not address the problem keywords")
        
        return len(issues) == 0, issues

# Global instance
model_validator = ModelValidator()