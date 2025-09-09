

import os
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from flask_cors import CORS
import cv2
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to accept requests from your React frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Model paths
MODEL_PATHS = {
    'bone_fracture': '../ml_models/Bone_Fracture.keras',
    'brain_tumor': '../ml_models/Brain_Tumor.h5',
    'breast_cancer': '../ml_models/Breast_Cancer.h5',
    'pneumonia': '../ml_models/pneumonia_model_final.h5',
    'anemia': '../ml_models/best_cnn_model.keras',
    'skin_cancer': '../ml_models/skin_cancer_vgg16.h5',
}


# Load models
brain_tumor_model = load_model(MODEL_PATHS['brain_tumor'])
breast_cancer_model = load_model(MODEL_PATHS['breast_cancer'])
pneumonia_model = load_model(MODEL_PATHS['pneumonia'])
bone_fracture_model = load_model(MODEL_PATHS['bone_fracture'])
anemia_model = load_model(MODEL_PATHS['anemia'])
skin_cancer_model = load_model(MODEL_PATHS['skin_cancer'])

# Compile models
brain_tumor_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
breast_cancer_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
pneumonia_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
bone_fracture_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
anemia_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
skin_cancer_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Class names for pneumonia
pneumonia_names = {
    0: 'Normal',
    1: 'Pneumonia'
}

# Class names for brain tumor
tumor_names = {
    0: 'Glioma',
    1: 'Meningioma',
    2: 'Pituitary',
    3: 'No Tumor'
}

# Class names for breast cancer
breast_cancer_names = {
    0: 'Benign',
    1: 'Malignant'
}

# Class names for bone fracture
bone_fracture_names = {
    0: 'Normal',
    1: 'Fracture'
}

# Class names for anemia
anemia_names = {
    0: 'Normal',
    1: 'Anemia'
}

# Class names for skin cancer
skin_cancer_names = {
    0: 'Benign',
    1: 'Malignant'
}


def preprocess_brain_tumor_image(image_stream, img_size=(224, 224)):
    # Read image from stream and convert to OpenCV format
    image = Image.open(image_stream).convert('RGB')
    image = image.resize(img_size)
    img = np.array(image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img = np.expand_dims(img, axis=-1)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

def preprocess_breast_cancer_image(image_stream, img_size=(224, 224)):
    # Read image from stream and convert to RGB
    image = Image.open(image_stream).convert('RGB')
    image = image.resize(img_size)
    img_array = np.array(image)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_pneumonia_image(image_stream, img_size=(224, 224)):
    """
    Preprocess image for pneumonia detection:
    1. Convert to grayscale
    2. Resize to target size
    3. Normalize pixel values
    4. Add channel and batch dimensions
    """
    try:
        # Read image from stream and convert to grayscale
        image = Image.open(image_stream).convert('L')
        image = image.resize(img_size)
        img_array = np.array(image)
        
        # Add channel dimension for grayscale
        img_array = np.expand_dims(img_array, axis=-1)
        
        # Normalize pixel values
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing pneumonia image: {str(e)}")
        raise

def preprocess_bone_fracture_image(image_stream, img_size=(224, 224)):
    """
    Preprocess image for bone fracture detection:
    1. Convert to grayscale (X-rays are grayscale)
    2. Resize to target size
    3. Normalize pixel values
    4. Add channel and batch dimensions
    """
    try:
        # Read image from stream and convert to grayscale
        image = Image.open(image_stream).convert('L')
        image = image.resize(img_size)
        img_array = np.array(image)
        
        # Add channel dimension for grayscale
        img_array = np.expand_dims(img_array, axis=-1)
        
        # Normalize pixel values
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing bone fracture image: {str(e)}")
        raise

def preprocess_skin_cancer_image(image_stream, img_size=(224, 224)):
    """
    Preprocess image for skin cancer detection:
    1. Convert to RGB (VGG16 was trained on RGB images)
    2. Resize to target size
    3. Normalize pixel values
    4. Add batch dimension
    """
    try:
        # Read image from stream and convert to RGB
        image = Image.open(image_stream).convert('RGB')
        image = image.resize(img_size)
        img_array = np.array(image)
        
        # Normalize pixel values
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing skin cancer image: {str(e)}")
        raise

def preprocess_anemia_image(image_stream, img_size=(224, 224)):
    """
    Preprocess image for anemia detection:
    1. Convert to RGB (input is likely a microscope image)
    2. Resize to target size
    3. Normalize pixel values
    4. Add batch dimension
    """
    try:
        # Read image from stream and convert to RGB
        image = Image.open(image_stream).convert('RGB')
        image = image.resize(img_size)
        img_array = np.array(image)
        
        # Normalize pixel values
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing anemia image: {str(e)}")
        raise


# Brain tumor prediction endpoint
@app.route('/predict/brain_tumor', methods=['POST'])
def predict_brain_tumor():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    try:
        img_array = preprocess_brain_tumor_image(image.stream)
        predictions = brain_tumor_model.predict(img_array)
        predicted_class_index = int(np.argmax(predictions, axis=1)[0])
        predicted_class_name = tumor_names.get(predicted_class_index, "Unknown")
        is_tumor_present = predicted_class_name != 'No Tumor'
        confidence = float(np.max(predictions))

        return jsonify({
            'prediction': predicted_class_name,
            'is_disease_present': is_tumor_present,
            'confidence': confidence,
            'raw': predictions.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Breast cancer prediction endpoint
@app.route('/predict/breast_cancer', methods=['POST'])
def predict_breast_cancer():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    try:
        img_array = preprocess_breast_cancer_image(image.stream)
        predictions = breast_cancer_model.predict(img_array)
        prediction_value = float(predictions[0][0])
        predicted_class_index = 1 if prediction_value >= 0.5 else 0
        predicted_class_name = breast_cancer_names.get(predicted_class_index, "Unknown")

        return jsonify({
            'prediction': predicted_class_name,
            'is_disease_present': predicted_class_index == 1,
            'confidence': prediction_value if predicted_class_index == 1 else 1 - prediction_value,
            'raw': predictions.tolist()
        })
    except Exception as e:
        print(f"Error in breast cancer prediction: {str(e)}")  # For debugging
        return jsonify({'error': str(e)}), 500

# Pneumonia prediction endpoint
@app.route('/predict/pneumonia', methods=['POST'])
def predict_pneumonia():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    try:
        img_array = preprocess_pneumonia_image(image.stream)
        # Match model's expected channels if needed
        expected_channels = pneumonia_model.input_shape[-1]
        if expected_channels != img_array.shape[-1]:
            img_array = np.repeat(img_array, expected_channels, axis=-1)
        
        predictions = pneumonia_model.predict(img_array)
        prediction_value = float(predictions[0][0])
        predicted_class_index = 1 if prediction_value >= 0.5 else 0
        predicted_class_name = pneumonia_names.get(predicted_class_index, "Unknown")
        
        return jsonify({
            'prediction': predicted_class_name,
            'is_disease_present': predicted_class_index == 1,
            'confidence': prediction_value if predicted_class_index == 1 else 1 - prediction_value,
            'raw': predictions.tolist()
        })
    except Exception as e:
        print(f"Error in pneumonia prediction: {str(e)}")  # For debugging
        return jsonify({'error': str(e)}), 500

# Bone fracture prediction endpoint
@app.route('/predict/bone_fracture', methods=['POST'])
def predict_bone_fracture():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    try:
        img_array = preprocess_bone_fracture_image(image.stream)
        # Match model's expected channels if needed
        expected_channels = bone_fracture_model.input_shape[-1]
        if expected_channels != img_array.shape[-1]:
            img_array = np.repeat(img_array, expected_channels, axis=-1)
        
        predictions = bone_fracture_model.predict(img_array)
        prediction_value = float(predictions[0][0])
        predicted_class_index = 1 if prediction_value >= 0.5 else 0
        predicted_class_name = bone_fracture_names.get(predicted_class_index, "Unknown")
        
        return jsonify({
            'prediction': predicted_class_name,
            'is_disease_present': predicted_class_index == 1,
            'confidence': prediction_value if predicted_class_index == 1 else 1 - prediction_value,
            'raw': predictions.tolist()
        })
    except Exception as e:
        print(f"Error in bone fracture prediction: {str(e)}")  # For debugging
        return jsonify({'error': str(e)}), 500

# Anemia prediction endpoint
@app.route('/predict/anemia', methods=['POST'])
def predict_anemia():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    try:
        img_array = preprocess_anemia_image(image.stream)
        predictions = anemia_model.predict(img_array)
        prediction_value = float(predictions[0][0])
        predicted_class_index = 1 if prediction_value >= 0.5 else 0
        predicted_class_name = anemia_names.get(predicted_class_index, "Unknown")
        
        return jsonify({
            'prediction': predicted_class_name,
            'is_disease_present': predicted_class_index == 1,
            'confidence': prediction_value if predicted_class_index == 1 else 1 - prediction_value,
            'raw': predictions.tolist()
        })
    except Exception as e:
        print(f"Error in anemia prediction: {str(e)}")  # For debugging
        return jsonify({'error': str(e)}), 500

# Skin cancer prediction endpoint
@app.route('/predict/skin_cancer', methods=['POST'])
def predict_skin_cancer():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    try:
        img_array = preprocess_skin_cancer_image(image.stream)
        predictions = skin_cancer_model.predict(img_array)
        prediction_value = float(predictions[0][0])
        predicted_class_index = 1 if prediction_value >= 0.5 else 0
        predicted_class_name = skin_cancer_names.get(predicted_class_index, "Unknown")
        
        return jsonify({
            'prediction': predicted_class_name,
            'is_disease_present': predicted_class_index == 1,
            'confidence': prediction_value if predicted_class_index == 1 else 1 - prediction_value,
            'raw': predictions.tolist()
        })
    except Exception as e:
        print(f"Error in skin cancer prediction: {str(e)}")  # For debugging
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return 'ML Disease Prediction API is running.'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
