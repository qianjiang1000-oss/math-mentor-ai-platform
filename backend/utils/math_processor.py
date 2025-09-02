"""
Mathematical text processing utilities
"""

import re
from typing import List, Dict, Tuple
import logging
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr

logger = logging.getLogger(__name__)

class MathProcessor:
    """Process and analyze mathematical text"""
    
    @staticmethod
    def normalize_math_expression(text: str) -> str:
        """Normalize mathematical expressions for consistency"""
        if not text:
            return ""
        
        # Convert to lowercase and strip whitespace
        normalized = text.lower().strip()
        
        # Replace common mathematical symbols with consistent representations
        replacements = {
            r'\\times': '*',
            r'\\div': '/',
            r'\\cdot': '*',
            r'\\sqrt': 'sqrt',
            r'\\frac': 'frac',
            r'\\pi': 'pi',
            r'\\theta': 'theta',
            r'\\alpha': 'alpha',
            r'\\beta': 'beta',
            r'\\gamma': 'gamma',
            r'\\int': 'integral',
            r'\\sum': 'sum',
            r'\\infty': 'infinity',
            r'\\pm': '±',
            r'\\approx': '≈',
            r'\\neq': '≠',
            r'\\leq': '≤',
            r'\\geq': '≥',
            r'\\rightarrow': '→',
            r'\^': '**',  # Convert caret to double asterisk for exponentiation
        }
        
        for pattern, replacement in replacements.items():
            normalized = re.sub(pattern, replacement, normalized)
        
        # Remove extra whitespace around operators
        normalized = re.sub(r'\s*([\+\-\*\/\=\<\>\(\)])\s*', r' \1 ', normalized)
        
        # Remove multiple spaces
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        return normalized
    
    @staticmethod
    def extract_math_concepts(text: str) -> List[str]:
        """Extract mathematical concepts from text"""
        concepts = []
        text_lower = text.lower()
        
        # Mathematical concept patterns with weights
        concept_patterns = {
            'algebra': ['solve', 'equation', 'variable', 'x', 'y', 'z', 'algebra', 'polynomial', 'quadratic', 'linear'],
            'calculus': ['derivative', 'integral', 'limit', 'differentiate', 'calculus', 'differentiation', 'integration', 'derivative'],
            'geometry': ['area', 'volume', 'angle', 'circle', 'triangle', 'geometry', 'perimeter', 'radius', 'diameter', 'pythagorean'],
            'trigonometry': ['sin', 'cos', 'tan', 'trig', 'angle', 'trigonometry', 'sine', 'cosine', 'tangent', 'cotangent'],
            'probability': ['probability', 'chance', 'likely', 'random', 'stats', 'odds', 'expectation', 'distribution'],
            'statistics': ['mean', 'median', 'mode', 'standard deviation', 'statistics', 'variance', 'standard deviation', 'correlation'],
            'arithmetic': ['add', 'subtract', 'multiply', 'divide', 'sum', 'difference', 'product', 'quotient', 'fraction', 'decimal']
        }
        
        # Count occurrences for each concept
        concept_scores = {}
        for concept, keywords in concept_patterns.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                concept_scores[concept] = score
        
        # Get top 3 concepts by score
        if concept_scores:
            sorted_concepts = sorted(concept_scores.items(), key=lambda x: x[1], reverse=True)
            concepts = [concept for concept, score in sorted_concepts[:3]]
        
        return concepts if concepts else ['general mathematics']
    
    @staticmethod
    def validate_problem_structure(problem: str) -> bool:
        """Validate if text appears to be a mathematical problem"""
        if not problem or len(problem.strip()) < 10:
            return False
        
        # Check for mathematical indicators
        math_indicators = [
            r'solve',
            r'find',
            r'calculate',
            r'compute',
            r'derivative',
            r'integral',
            r'equation',
            r'=\s*[0-9]',
            r'[0-9]+\s*[\+\-\*\/]\s*[0-9]+',
            r'x\s*[=\+\-\*\/]',
            r'what is',
            r'how many',
        ]
        
        return any(re.search(pattern, problem, re.IGNORECASE) for pattern in math_indicators)
    
    @staticmethod
    def extract_variables(expression: str) -> List[str]:
        """Extract variables from mathematical expression"""
        try:
            # Use sympy to parse and extract variables
            expr = parse_expr(expression)
            variables = [str(var) for var in expr.free_symbols]
            return sorted(variables)
        except:
            # Fallback to simple regex extraction
            variables = re.findall(r'\b[a-zA-Z][a-zA-Z0-9]*\b', expression)
            return list(set(variables))
    
    @staticmethod
    def simplify_expression(expression: str) -> str:
        """Simplify mathematical expression using sympy"""
        try:
            expr = parse_expr(expression)
            simplified = sp.simplify(expr)
            return str(simplified)
        except:
            return expression
    
    @staticmethod
    def generate_step_by_step(problem: str, solution: str) -> List[str]:
        """Generate step-by-step solution explanation"""
        steps = []
        
        # Basic step generation based on problem type
        if 'solve for' in problem.lower() or '=' in problem:
            steps = [
                "Step 1: Identify the equation and variables",
                "Step 2: Simplify both sides of the equation",
                "Step 3: Isolate the variable term",
                "Step 4: Solve for the variable",
                f"Step 5: Verify the solution: {solution}"
            ]
        elif 'derivative' in problem.lower():
            steps = [
                "Step 1: Identify the function to differentiate",
                "Step 2: Apply differentiation rules (power rule, chain rule, etc.)",
                "Step 3: Simplify the derivative expression",
                f"Step 4: Final derivative: {solution}"
            ]
        elif 'integral' in problem.lower():
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

# Global instance
math_processor = MathProcessor()