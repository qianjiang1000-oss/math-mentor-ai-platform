#!/usr/bin/env python3
"""
AI Model Training Script with actual TensorFlow implementation
"""

import sys
import os
import logging
import sqlite3
import pandas as pd
import numpy as np
import json
from datetime import datetime
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, LSTM, Embedding, Bidirectional, Dropout, Attention
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import re
import matplotlib.pyplot as plt
import seaborn as sns

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('../logs/training.log')
    ]
)
logger = logging.getLogger(__name__)

class MathAITrainer:
    """Handles the complete AI training pipeline"""
    
    def __init__(self):
        self.tokenizer = None
        self.label_encoder = None
        self.model = None
        self.max_sequence_length = int(os.getenv('MAX_SEQUENCE_LENGTH', 128))
        self.vocab_size = int(os.getenv('VOCAB_SIZE', 10000))
        self.embedding_dim = int(os.getenv('EMBEDDING_DIM', 128))
        self.model_dir = os.getenv('MODEL_PATH', 'models')
        
    def preprocess_text(self, text):
        """Preprocess mathematical text"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Replace mathematical symbols with readable equivalents
        replacements = {
            r'\\times': ' * ',
            r'\\div': ' / ',
            r'\\cdot': ' * ',
            r'\\sqrt': 'sqrt ',
            r'\\frac': 'frac ',
            r'\\pi': 'pi',
            r'\\theta': 'theta',
            r'\\alpha': 'alpha',
            r'\\beta': 'beta',
            r'\\gamma': 'gamma',
            r'\\int': 'integral ',
            r'\\sum': 'sum ',
            r'\\infty': 'infinity',
            r'\\pm': 'plus minus',
            r'\\approx': 'approximately',
            r'\\neq': 'not equal',
            r'\\leq': 'less than or equal',
            r'\\geq': 'greater than or equal',
            r'\\rightarrow': 'approaches',
        }
        
        for pattern, replacement in replacements.items():
            text = re.sub(pattern, replacement, text)
        
        # Remove special characters but keep basic math symbols
        text = re.sub(r'[^\w\s\+\-\*\/\=\<\>\(\)\.]', ' ', text)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def load_training_data(self, db_path):
        """Load and prepare training data from database"""
        try:
            conn = sqlite3.connect(db_path)
            query = """
            SELECT id, problem_text, solution_text, mathematical_concepts 
            FROM training_data 
            WHERE used_in_training = FALSE AND validation_status = 'approved'
            """
            df = pd.read_sql_query(query, conn)
            conn.close()
            
            if len(df) < 10:
                logger.warning(f"Insufficient training data: {len(df)} samples")
                return None, None, None
            
            logger.info(f"Loaded {len(df)} training samples")
            
            # Preprocess problems and solutions
            problems = [self.preprocess_text(problem) for problem in df['problem_text']]
            solutions = [self.preprocess_text(solution) for solution in df['solution_text']]
            
            # Remove empty or invalid samples
            valid_indices = [i for i, (p, s) in enumerate(zip(problems, solutions)) 
                           if p and s and len(p) > 5 and len(s) > 2]
            problems = [problems[i] for i in valid_indices]
            solutions = [solutions[i] for i in valid_indices]
            df = df.iloc[valid_indices]
            
            logger.info(f"After cleaning: {len(problems)} valid samples")
            
            return problems, solutions, df
            
        except Exception as e:
            logger.error(f"Error loading training data: {str(e)}")
            return None, None, None
    
    def prepare_data(self, problems, solutions):
        """Prepare data for training"""
        # Tokenize problems
        self.tokenizer = Tokenizer(
            num_words=self.vocab_size,
            oov_token='<OOV>',
            filters='!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~\t\n'
        )
        self.tokenizer.fit_on_texts(problems)
        
        # Convert problems to sequences
        sequences = self.tokenizer.texts_to_sequences(problems)
        X = pad_sequences(sequences, maxlen=self.max_sequence_length)
        
        # Encode solutions (treating each unique solution as a class)
        self.label_encoder = LabelEncoder()
        y = self.label_encoder.fit_transform(solutions)
        
        logger.info(f"Vocabulary size: {len(self.tokenizer.word_index)}")
        logger.info(f"Number of classes: {len(self.label_encoder.classes_)}")
        logger.info(f"Input shape: {X.shape}")
        
        return X, y
    
    def build_model(self, num_classes):
        """Build the neural network model"""
        model = Sequential([
            Embedding(
                input_dim=self.vocab_size,
                output_dim=self.embedding_dim,
                input_length=self.max_sequence_length,
                mask_zero=True
            ),
            Bidirectional(LSTM(128, return_sequences=True)),
            Dropout(0.4),
            Bidirectional(LSTM(64)),
            Dropout(0.3),
            Dense(256, activation='relu'),
            Dropout(0.3),
            Dense(128, activation='relu'),
            Dropout(0.2),
            Dense(num_classes, activation='softmax')
        ])
        
        optimizer = Adam(learning_rate=0.001)
        model.compile(
            optimizer=optimizer,
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        model.summary(print_fn=logger.info)
        
        return model
    
    def train_model(self, X, y, validation_split=0.2):
        """Train the model"""
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42, stratify=y
        )
        
        logger.info(f"Training samples: {X_train.shape[0]}")
        logger.info(f"Validation samples: {X_val.shape[0]}")
        
        # Build model
        self.model = self.build_model(len(np.unique(y)))
        
        # Callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                patience=10,
                restore_best_weights=True,
                monitor='val_loss',
                verbose=1
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                factor=0.2,
                patience=5,
                min_lr=1e-6,
                verbose=1
            ),
            tf.keras.callbacks.ModelCheckpoint(
                filepath=os.path.join(self.model_dir, 'best_model.h5'),
                save_best_only=True,
                monitor='val_loss',
                verbose=1
            )
        ]
        
        # Train
        logger.info("Starting model training...")
        history = self.model.fit(
            X_train, y_train,
            epochs=int(os.getenv('TRAINING_EPOCHS', 100)),
            batch_size=int(os.getenv('BATCH_SIZE', 32)),
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate_model(self, X, y):
        """Evaluate model performance"""
        if self.model is None:
            return None
        
        # Predict
        y_pred = self.model.predict(X, verbose=0)
        y_pred_classes = np.argmax(y_pred, axis=1)
        
        # Calculate metrics
        accuracy = accuracy_score(y, y_pred_classes)
        
        # Detailed classification report
        if len(np.unique(y)) > 1:
            try:
                report = classification_report(y, y_pred_classes, 
                                             target_names=[str(cls) for cls in self.label_encoder.classes_], 
                                             output_dict=True)
                logger.info(f"Overall accuracy: {accuracy:.4f}")
                logger.info(f"Precision: {report['weighted avg']['precision']:.4f}")
                logger.info(f"Recall: {report['weighted avg']['recall']:.4f}")
                logger.info(f"F1-score: {report['weighted avg']['f1-score']:.4f}")
            except:
                logger.info(f"Accuracy: {accuracy:.4f}")
        
        return accuracy
    
    def save_model(self):
        """Save model and artifacts"""
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Save model
        model_path = os.path.join(self.model_dir, 'math_model.h5')
        self.model.save(model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Save tokenizer
        tokenizer_path = os.path.join(self.model_dir, 'tokenizer.pkl')
        with open(tokenizer_path, 'wb') as f:
            pickle.dump(self.tokenizer, f)
        logger.info(f"Tokenizer saved to {tokenizer_path}")
        
        # Save label encoder
        label_encoder_path = os.path.join(self.model_dir, 'label_encoder.pkl')
        with open(label_encoder_path, 'wb') as f:
            pickle.dump(self.label_encoder, f)
        logger.info(f"Label encoder saved to {label_encoder_path}")
        
        # Save model config
        config = {
            'max_sequence_length': self.max_sequence_length,
            'vocab_size': self.vocab_size,
            'embedding_dim': self.embedding_dim,
            'model_architecture': 'Bidirectional_LSTM',
            'training_date': datetime.now().isoformat(),
            'num_classes': len(self.label_encoder.classes_),
            'vocabulary_size': len(self.tokenizer.word_index)
        }
        
        config_path = os.path.join(self.model_dir, 'model_config.json')
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f"Model config saved to {config_path}")
        
        # Save training report
        report = {
            'training_completed': datetime.now().isoformat(),
            'num_samples': X.shape[0] if hasattr(self, 'X') else 0,
            'num_classes': len(self.label_encoder.classes_),
            'vocabulary_size': len(self.tokenizer.word_index)
        }
        
        report_path = os.path.join(self.model_dir, 'training_report.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
    
    def update_database(self, db_path, df, accuracy, training_duration):
        """Update database after training"""
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Mark training data as used
            if len(df) > 0:
                placeholders = ','.join(['?'] * len(df))
                cursor.execute(f"UPDATE training_data SET used_in_training = TRUE WHERE id IN ({placeholders})", 
                              df['id'].tolist())
            
            # Record training session
            cursor.execute('''INSERT INTO ai_models 
                            (model_name, version, accuracy, training_size, training_duration)
                            VALUES (?, ?, ?, ?, ?)''',
                            ('math_solver', '2.0.0', accuracy, len(df), training_duration))
            
            # Update training progress table
            cursor.execute('''INSERT INTO training_progress 
                            (training_id, epoch, accuracy, loss, val_accuracy, val_loss)
                            VALUES (?, ?, ?, ?, ?, ?)''',
                            (f"train_{int(datetime.now().timestamp())}", 
                             'final', accuracy, 0, accuracy, 0))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Database updated: marked {len(df)} samples as used")
            
        except Exception as e:
            logger.error(f"Error updating database: {str(e)}")
            raise

def train_ai_model():
    """Main training function"""
    try:
        logger.info("🚀 Starting AI model training...")
        logger.info("=" * 50)
        start_time = datetime.now()
        
        # Initialize trainer
        trainer = MathAITrainer()
        
        # Load data
        db_path = '../database/math_tutor.db'
        problems, solutions, df = trainer.load_training_data(db_path)
        
        if problems is None or len(problems) == 0:
            logger.error("No valid training data available")
            return False
        
        logger.info(f"📊 Training with {len(problems)} samples")
        
        # Prepare data
        logger.info("🔧 Preprocessing data...")
        X, y = trainer.prepare_data(problems, solutions)
        
        # Train model
        logger.info("🧠 Training neural network...")
        history = trainer.train_model(X, y)
        
        # Evaluate model
        logger.info("📈 Evaluating model...")
        accuracy = trainer.evaluate_model(X, y)
        logger.info(f"✅ Model accuracy: {accuracy:.4f}")
        
        # Save model
        logger.info("💾 Saving model...")
        trainer.save_model()
        
        # Update database
        training_duration = (datetime.now() - start_time).total_seconds()
        trainer.update_database(db_path, df, accuracy, training_duration)
        
        logger.info("🎉 Model training completed successfully!")
        logger.info(f"⏱️  Training duration: {training_duration:.2f} seconds")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Training failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == '__main__':
    success = train_ai_model()
    if success:
        logger.info("✅ Training script completed successfully")
    else:
        logger.error("❌ Training script failed")
    sys.exit(0 if success else 1)