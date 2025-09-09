import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import numpy as np
import tensorflow as tf
import cv2


# Use the correct model file name
model = tf.keras.models.load_model('Brain_Tumor.h5')
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

tumor_names = {
    0: 'Glioma',
    1: 'Meningioma',
    2: 'Pituitary',
    3: 'No Tumor'
}

def classify_tumor(image_path):
    processed_image = preprocess_image(image_path)
    predictions = model.predict(processed_image)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class_name = tumor_names.get(predicted_class_index, "Unknown")

    is_tumor_present = predicted_class_name != 'No Tumor'
    bounding_box_image = draw_bounding_box(image_path, is_tumor_present)
    
    output_image_path = os.path.join('static', 'output_images', os.path.basename(image_path))
    cv2.imwrite(output_image_path, bounding_box_image)

    return predicted_class_name, output_image_path

def preprocess_image(image_path, img_size=(224, 224)):
    img = cv2.imread(image_path)
    img = cv2.resize(img, img_size)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = np.expand_dims(img, axis=-1)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

def draw_bounding_box(image_path, is_tumor_present):
    img = cv2.imread(image_path)
    if is_tumor_present:
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray_img, 128, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
    return img


model = tf.keras.models.load_model('brain_tumor_classification_model.h5')
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

tumor_names = {
    0: 'Glioma',
    1: 'Meningioma',
    2: 'Pituitary',
    3: 'No Tumor'
}

def preprocess_image(image_path, img_size=(224, 224)):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Image not found or could not be loaded: {image_path}")
    img = cv2.resize(img, img_size)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = np.expand_dims(img, axis=-1)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

def predict_tumor(image_path):
    processed_image = preprocess_image(image_path)
    predictions = model.predict(processed_image)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class_name = tumor_names.get(predicted_class_index, "Unknown")
    is_tumor_present = predicted_class_name != 'No Tumor'
    return predicted_class_name, is_tumor_present

def draw_bounding_box(image_path, is_tumor_present):
    img = cv2.imread(image_path)
    if is_tumor_present:
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray_img, 128, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
    return img

class TumorClassifierApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Brain Tumor Classifier")
        self.root.geometry("600x700")

        tk.Label(root, text="Brain Tumor Classifier", font=("Arial", 20)).pack(pady=20)
        tk.Button(root, text="Upload Image", command=self.upload_image).pack(pady=10)
        self.canvas = tk.Canvas(root, width=400, height=400, bg="lightgray")
        self.canvas.pack(pady=10)
        tk.Button(root, text="Predict Tumor", command=self.predict_image).pack(pady=10)
        self.result_label = tk.Label(root, text="", font=("Arial", 14))
        self.result_label.pack(pady=20)

    def upload_image(self):
        self.image_path = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg *.jpeg *.png")])
        if self.image_path:
            img = Image.open(self.image_path)
            img = img.resize((400, 400))
            self.img_tk = ImageTk.PhotoImage(img)
            self.canvas.create_image(0, 0, anchor=tk.NW, image=self.img_tk)

    def predict_image(self):
        if hasattr(self, 'image_path'):
            predicted_class_name, is_tumor_present = predict_tumor(self.image_path)
            result_text = f"Tumor Detected: {predicted_class_name}" if is_tumor_present else "No Tumor Detected"
            self.result_label.config(text=result_text)

            processed_img = draw_bounding_box(self.image_path, is_tumor_present)
            processed_img = cv2.cvtColor(processed_img, cv2.COLOR_BGR2RGB)
            img_with_box = Image.fromarray(processed_img)
            img_with_box = img_with_box.resize((400, 400))
            self.img_tk_with_box = ImageTk.PhotoImage(img_with_box)
            self.canvas.create_image(0, 0, anchor=tk.NW, image=self.img_tk_with_box)

        else:
            messagebox.showwarning("No Image", "Please upload an image first.")

if __name__ == "__main__":
    root = tk.Tk()
    app = TumorClassifierApp(root)
    root.mainloop()




# BREAST CANCER DETECTION


# predict_breast_cancer.py
import numpy as np
from pathlib import Path
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

MODEL_PATH = Path("/content/Breast_Cancer.h5")  # change path if needed

def load_my_model(path=MODEL_PATH):
    if not Path(path).exists():
        raise FileNotFoundError(f"Model file not found at {path}")
    model = load_model(str(path))
    return model

def predict_from_image(image_path, model, target_size=None, scale=True, label_map=None):
    """
    Predict from an image. Adjust preprocessing to match training.
    - image_path: path to image file
    - target_size: (height, width). If None, tries to infer from model.input_shape.
    - scale: divide pixels by 255 if True (common)
    - label_map: dict mapping class indices to labels, e.g. {0: 'Benign', 1: 'Malignant'}
    Returns: (raw_prediction_array, predicted_label_or_index)
    """
    img = Image.open(image_path).convert("RGB")
    if target_size is None:
        # try to infer target_size from model.input_shape
        shape = getattr(model, "input_shape", None)
        if shape is None:
            raise ValueError("target_size not provided and model.input_shape unavailable.")
        # model.input_shape typically (None, H, W, C) or (None, C, H, W)
        if len(shape) == 4:
            # prefer channels_last: (None, H, W, C)
            if shape[1] is None:
                h, w = int(shape[2]), int(shape[3]) if len(shape) > 3 else (int(shape[1]), int(shape[2]))
            else:
                h, w = int(shape[1]), int(shape[2])
            target_size = (h, w)
        else:
            raise ValueError("Model input shape doesn't look like an image model: " + str(shape))
    # PIL resize expects (width, height)
    img = img.resize((target_size[1], target_size[0]))
    arr = img_to_array(img).astype("float32")
    # expand batch dimension
    arr = np.expand_dims(arr, axis=0)
    if scale:
        arr /= 255.0
    preds = model.predict(arr)
    raw = preds[0]
    # Decide label from output shape:
    if raw.ndim == 0 or raw.shape == ():
        # scalar output (rare)
        label = float(raw)
    elif raw.shape == (1,):
        prob = float(raw[0])
        label_idx = 1 if prob >= 0.5 else 0
        label = label_map.get(label_idx, label_idx) if label_map else label_idx
    elif raw.size == 2:
        label_idx = int(np.argmax(raw))
        label = label_map.get(label_idx, label_idx) if label_map else label_idx
    else:
        # multi-class
        label_idx = int(np.argmax(raw))
        label = label_map.get(label_idx, label_idx) if label_map else label_idx
    return raw, label

def predict_from_features(features, model, scale_fn=None, label_map=None):
    """
    Predict from a feature vector (tabular/structured input).
    - features: 1D array-like (order must match training order)
    - scale_fn: optional function to scale the features (e.g., a saved StandardScaler.transform)
    - label_map: optional mapping from predicted index to label
    Returns: (raw_prediction_array, predicted_label_or_index)
    """
    arr = np.asarray(features, dtype="float32")
    if arr.ndim == 1:
        arr = np.expand_dims(arr, axis=0)
    if scale_fn is not None:
        arr = scale_fn(arr)
    preds = model.predict(arr)
    raw = preds[0]
    if raw.ndim == 0 or raw.shape == (1,):
        prob = float(raw[0]) if raw.shape == (1,) else float(raw)
        label_idx = 1 if prob >= 0.5 else 0
        label = label_map.get(label_idx, label_idx) if label_map else label_idx
    else:
        label_idx = int(np.argmax(raw))
        label = label_map.get(label_idx, label_idx) if label_map else label_idx
    return raw, label

if __name__ == "__main__":
    model = load_my_model(MODEL_PATH)
    print("Model loaded. Summary:")
    try:
        model.summary()
    except Exception:
        print("(Could not print full summary)")

    # Print inferred input shape
    try:
        print("Inferred model.input_shape:", model.input_shape)
    except Exception:
        print("Could not infer model input shape.")

    # ----- Example: Image prediction -----
    # Replace 'example.jpg' with your image path and ensure target_size matches training.
    # label_map = {0: 'Benign', 1: 'Malignant'}
    # raw, label = predict_from_image("example.jpg", model, target_size=(224,224), label_map=label_map)
    # print("Image raw output:", raw, "Predicted label:", label)

    # ----- Example: Tabular features prediction -----
    # Replace with a real feature vector in the same order your model was trained on.
    # example_features = [value1, value2, value3, ...]
    # raw, label = predict_from_features(example_features, model, label_map={0:'Benign',1:'Malignant'})
    # print("Features raw output:", raw, "Predicted label:", label)


raw, label = predict_from_image("/content/1.jpg", model, target_size=(224,224), label_map={0:"Benign", 1:"Malignant"})
print("Prediction:", label)





# PNEUMONIA DETECTION


from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np

# Load your model
model = load_model("pneumonia_model_final.h5")

def predict_pneumonia(image_path, model, target_size=(224, 224)):
    # Load image in grayscale
    img = Image.open(image_path).convert("L")
    img = img.resize(target_size)
    arr = img_to_array(img)  # shape (224, 224, 1)

    # Repeat channels to match model input (e.g., 9 channels)
    expected_channels = model.input_shape[-1]
    if expected_channels != arr.shape[-1]:
        arr = np.repeat(arr, expected_channels, axis=-1)

    # Add batch dimension and scale
    arr = np.expand_dims(arr, axis=0).astype("float32") / 255.0

    # Predict
    preds = model.predict(arr)
    raw = preds[0]

    # Interpret result
    if len(raw) == 1:  # sigmoid
        prob = float(raw[0])
        label = "Pneumonia" if prob >= 0.5 else "Normal"
    else:  # softmax
        label = "Normal" if np.argmax(raw) == 0 else "Pneumonia"

    return raw, label

# Example usage
raw, label = predict_pneumonia("/content/p1.jpg", model)
print("Raw prediction:", raw)
print("Final prediction:", label)


# BONE FRACTURE DETECTION


from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np

# ------------------------
# Load your bone fracture model (.keras format)
# ------------------------
model = load_model("/content/pneumonia_model_final.h5")
print("Model loaded successfully.")
print("Expected input shape:", model.input_shape)

# ------------------------
# Prediction function
# ------------------------
def predict_fracture(image_path, model, target_size=(224, 224)):
    # Load image in grayscale (change to "RGB" if your model was trained on RGB images)
    img = Image.open(image_path).convert("L")
    img = img.resize(target_size)
    arr = img_to_array(img)  # shape (224,224,1)

    # Match model’s expected channels
    expected_channels = model.input_shape[-1]
    if expected_channels != arr.shape[-1]:
        arr = np.repeat(arr, expected_channels, axis=-1)

    # Add batch dimension and scale
    arr = np.expand_dims(arr, axis=0).astype("float32") / 255.0

    # Predict
    preds = model.predict(arr)
    raw = preds[0]

    # Interpret output
    if len(raw) == 1:  # sigmoid (binary)
        prob = float(raw[0])
        label = "Fracture" if prob >= 0.5 else "Normal"
        confidence = prob if label == "Fracture" else 1 - prob
    else:  # softmax (multi-class)
        label_idx = np.argmax(raw)
        # Adjust these class names to match your training
        classes = ["Normal", "Fracture"]
        label = classes[label_idx]
        confidence = raw[label_idx]

    return raw, f"{label} ({confidence*100:.2f}%)"

# ------------------------
# Example usage
# ------------------------
test_image = "/content/b1.jpg"   # change to your X-ray image path
raw, label = predict_fracture(test_image, model)
print("Raw prediction:", raw)
print("Final prediction:", label)




# Anemia Detection


from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np

# ------------------------
# Load your anemia model
# ------------------------
model = load_model("/content/best_cnn_model.keras")
print("Model loaded successfully.")
print("Expected input shape:", model.input_shape)

# ------------------------
# Prediction function
# ------------------------
def predict_anemia(image_path, model, target_size=(224, 224)):
    # Load image (adjust mode based on training: "L" = grayscale, "RGB" if color images were used)
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)
    arr = img_to_array(img)  # (224,224,3)

    # Match expected channels
    expected_channels = model.input_shape[-1]
    if expected_channels != arr.shape[-1]:
        arr = np.repeat(arr[..., :1], expected_channels, axis=-1)  # replicate channels if needed

    # Add batch dimension and scale
    arr = np.expand_dims(arr, axis=0).astype("float32") / 255.0

    # Predict
    preds = model.predict(arr)
    raw = preds[0]

    # Interpret output
    if len(raw) == 1:  # sigmoid (binary classification)
        prob = float(raw[0])
        label = "Anemia" if prob >= 0.5 else "Normal"
        confidence = prob if label == "Anemia" else 1 - prob
    else:  # softmax (multi-class)
        label_idx = np.argmax(raw)
        # ⚠️ Change this list to your actual training class labels
        classes = ["Normal", "Anemia"]
        label = classes[label_idx]
        confidence = raw[label_idx]

    return raw, f"{label} ({confidence*100:.2f}%)"

# ------------------------
# Example usage
# ------------------------
test_image = "/content/a1.jpg"   # change to your test image path
raw, label = predict_anemia(test_image, model)
print("Raw prediction:", raw)
print("Final prediction:", label)





# SKIN CANCER DETECTION


from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np

# ------------------------
# Load your skin cancer model
# ------------------------
model = load_model("/content/skin_cancer_vgg16.h5")
print("Model loaded successfully.")
print("Expected input shape:", model.input_shape)

# ------------------------
# Prediction function
# ------------------------
def predict_skin_cancer(image_path, model, target_size=(224, 224)):
    # Load image in RGB (since VGG16 was trained on RGB images)
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)
    arr = img_to_array(img)  # shape (224,224,3)

    # Match expected channels
    expected_channels = model.input_shape[-1]
    if expected_channels != arr.shape[-1]:
        arr = np.repeat(arr[..., :1], expected_channels, axis=-1)

    # Add batch dimension and scale
    arr = np.expand_dims(arr, axis=0).astype("float32") / 255.0

    # Predict
    preds = model.predict(arr)
    raw = preds[0]

    # Interpret output
    if len(raw) == 1:  # sigmoid (binary)
        prob = float(raw[0])
        label = "Cancer" if prob >= 0.5 else "Normal"
        confidence = prob if label == "Cancer" else 1 - prob
    else:  # softmax (multi-class)
        label_idx = np.argmax(raw)
        # ⚠️ Change this list to your actual training classes
        classes = ["Benign", "Malignant"]  
        label = classes[label_idx]
        confidence = raw[label_idx]

    return raw, f"{label} ({confidence*100:.2f}%)"

# ------------------------
# Example usage
# ------------------------
test_image = "/content/s1.jpg"   # change to your test image path
raw, label = predict_skin_cancer(test_image, model)
print("Raw prediction:", raw)
print("Final prediction:", label)
