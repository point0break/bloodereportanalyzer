from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from flask_cors import CORS
from PIL import Image
from pytesseract import pytesseract
import torch
import os
import re

app = Flask(__name__)
CORS(app)

# Set the path to the Tesseract executable
pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

# Load the trained model
MODEL_PATH = r"C:\\Users\\Allen\\Desktop\\blood\\Trained model\\blood_test_gru_model (3).h5"
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

# Create a temp directory for file uploads
os.makedirs("temp", exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handle file upload and validate file type.
    """
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # Validate file type
    allowed_extensions = {'pdf', 'png', 'jpg', 'jpeg'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Invalid file type. Only PDF, PNG, and JPEG are allowed."}), 400

    # Save the file temporarily
    file_path = os.path.join("temp", file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({"error": f"Error saving file: {str(e)}"}), 500

    return jsonify({"message": "File received successfully!", "file_path": file_path})


@app.route("/process-file", methods=["POST"])
def process_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    file_path = os.path.join("temp", file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({"error": f"Error saving file: {str(e)}"}), 500

    try:
        # Perform OCR
        if file.content_type.startswith("image/"):
            image = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(image)
            print("Extracted text:", extracted_text)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        # Preprocess the extracted text for the model
        input_data = preprocess_text(extracted_text)
        if input_data is None:
            return jsonify({"error": "Failed to preprocess text for model."}), 400
        print("Preprocessed input shape:", input_data.shape)

        # Perform prediction using the model
        if model is None:
            return jsonify({"error": "Model is not loaded. Please check the model file."}), 500

        with torch.no_grad():
            prediction = model(input_data)
        print("Model prediction:", prediction)

        # Format and return the prediction result
        result = format_prediction(prediction)

    except Exception as e:
        return jsonify({"error": f"Error during processing: {str(e)}"}), 500

    finally:
        # Cleanup the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

    return jsonify({"extracted_text": extracted_text, "prediction": result})


def preprocess_text(text):
    """
    Preprocess the OCR-extracted text into a format compatible with the model.
    Adjust this based on your model's expected input format.
    """
    try:
        # Extract numerical values from text
        numeric_values = re.findall(r"\d+\.?\d*", text)
        numeric_values = [float(value) for value in numeric_values]

        # Convert to PyTorch tensor (adjust dimensions as per model requirements)
        input_tensor = torch.tensor(numeric_values, dtype=torch.float32).unsqueeze(0)  # Add batch dimension
        return input_tensor
    except Exception as e:
        print(f"Preprocessing error: {str(e)}")
        return None


def format_prediction(prediction):
    """
    Format the model's prediction into a human-readable format.
    """
    try:
        # Example: Convert tensor to list and interpret as labels
        prediction = prediction.squeeze().tolist()
        if isinstance(prediction, list) and len(prediction) == 1:
            return {"status": "Safe" if prediction[0] > 0.5 else "Not Safe"}
        return {"status": "Unknown", "details": prediction}

    except Exception as e:
        print(f"Formatting error: {str(e)}")
        return {"error": "Failed to format prediction."}


if __name__ == "__main__":
    # Run the Flask application
    app.run(debug=True)
