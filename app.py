# app.py (Fully Updated)
from flask import Flask, request, jsonify
from joblib import load
from flask_cors import CORS
from PIL import Image
from pytesseract import pytesseract
import numpy as np
import pandas as pd
import os
import re
import json
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
for handler in logging.root.handlers:
    if isinstance(handler, logging.StreamHandler):
        handler.stream.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

# Configure Tesseract
pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

# Load Model (if still needed for risk prediction)
MODEL_PATH = r"C:\\Users\\Allen\\Desktop\\blood\\Trained model\\rf_model (1).pkl"
try:
    model = load(MODEL_PATH)
    logging.info("✅ Model loaded successfully.")
    if hasattr(model, "feature_names_in_"):
        expected_features = model.feature_names_in_
        logging.info(f"Expected Features: {expected_features}")
    else:
        logging.warning("Model does not have 'feature_names_in_' attribute. Ensure feature names are aligned manually.")
except Exception as e:
    logging.error(f"❌ Error loading model: {str(e)}")
    model = None

# Create temp directory
os.makedirs("temp", exist_ok=True)

def parse_extracted_text(extracted_text):
    # Parse the extracted text into a list of (parameter, result, flag)
    data = []
    lines = extracted_text.split('\n')
    current_section = None

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Detect section headers (e.g., "Complete Blood Count (CBC)")
        if line in ["Complete Blood Count (CBC)", "Lipid Profile", "Liver Function Test (LFT)", 
                    "Kidney Function Test (KFT)", "Glucose Test", "Thyroid Function Test (TFT)"]:
            current_section = line
            continue
        # Match parameter lines with flexible formats
        # Try formats like "Hemoglobin (g/dL) 11.2 Low" or "Hemoglobin 11.2 g/dL Low"
        match = re.match(r"(\w+(?:\s+\w+)*)\s*(?:\((.*?)\))?\s*([\d.]+)\s*(?:(\w*/\w*)\s*)?(Low|High|Normal|Borderline)", line, re.IGNORECASE)
        if match:
            parameter = match.group(1).strip()
            unit = match.group(2) if match.group(2) else (match.group(4) if match.group(4) else "")
            result = float(match.group(3))
            flag = match.group(5).strip()
            data.append((parameter, result, flag))
    logging.info(f"Parsed Data: {data}")
    return data

def get_explanation_and_remedy(param, result, flag):
    explanations_and_remedies = {
        "Hemoglobin": {
            "low": (
                "Hemoglobin carries oxygen in the blood. Low levels may indicate anemia, often due to iron deficiency, blood loss, or chronic disease.",
                "Increase iron intake with foods like spinach, red meat, and lentils. Consider iron supplements if advised. Consult a hematologist."
            ),
            "high": (
                "High hemoglobin may indicate dehydration, smoking, or a condition like polycythemia vera, which increases red blood cell production.",
                "Stay hydrated and avoid smoking. Consult a hematologist for further evaluation."
            )
        },
        "WBC": {
            "low": (
                "White blood cells (WBCs) fight infections. Low levels may indicate a viral infection, bone marrow issues, or immune suppression.",
                "Boost immunity with a balanced diet rich in vitamin C (e.g., citrus fruits, bell peppers) and probiotics (e.g., yogurt). Consult a doctor if persistent."
            ),
            "high": (
                "High WBC levels may indicate an infection, inflammation, stress, or a blood disorder like leukemia.",
                "Address potential infections and reduce stress through relaxation techniques. Consult a doctor immediately for further tests."
            )
        },
        "Platelets": {
            "high": (
                "Platelets help with blood clotting. High levels may indicate inflammation, infection, or a bone marrow disorder, increasing clotting risk.",
                "Monitor for signs of clotting (e.g., swelling, pain). Avoid activities that increase injury risk. Consult a hematologist."
            ),
            "low": (
                "Low platelet levels may indicate bone marrow issues, viral infections, or autoimmune disorders, increasing bleeding risk.",
                "Avoid activities that may cause bleeding or bruising. Consult a hematologist for further evaluation."
            )
        },
        "RBC": {
            "low": (
                "Red blood cells (RBCs) carry oxygen. Low levels may indicate anemia, often due to iron deficiency, vitamin B12 deficiency, or chronic disease.",
                "Increase iron and vitamin B12 intake with foods like red meat, eggs, and fortified cereals. Consult a doctor for anemia evaluation."
            ),
            "high": (
                "High RBC levels may indicate dehydration, smoking, or a condition like polycythemia vera, which increases red blood cell production.",
                "Stay hydrated and avoid smoking. Consult a hematologist for further evaluation."
            )
        },
        "Hematocrit": {
            "low": (
                "Hematocrit measures the proportion of red blood cells in your blood. Low levels may indicate anemia or blood loss.",
                "Increase iron-rich foods (e.g., spinach, liver). Consult a doctor for anemia evaluation."
            ),
            "high": (
                "High hematocrit may indicate dehydration or a condition like polycythemia vera.",
                "Stay hydrated. Consult a hematologist for further evaluation."
            )
        },
        "MCV": {
            "high": (
                "MCV measures the average size of red blood cells. High levels may indicate vitamin B12 or folate deficiency, or alcohol use.",
                "Include vitamin B12 and folate-rich foods (e.g., eggs, fortified cereals). Reduce alcohol intake. Consult a doctor."
            ),
            "low": (
                "Low MCV may indicate iron deficiency anemia or thalassemia.",
                "Increase iron intake with foods like spinach and red meat. Consult a hematologist."
            )
        },
        "MCH": {
            "low": (
                "MCH measures the average amount of hemoglobin in red blood cells. Low levels may indicate iron deficiency anemia.",
                "Increase iron-rich foods (e.g., spinach, liver). Consult a doctor for anemia evaluation."
            ),
            "high": (
                "High MCH may indicate vitamin B12 or folate deficiency.",
                "Include vitamin B12 and folate-rich foods (e.g., eggs, fortified cereals). Consult a doctor."
            )
        },
        "MCHC": {
            "low": (
                "MCHC measures the concentration of hemoglobin in red blood cells. Low levels may indicate iron deficiency anemia.",
                "Increase iron intake with foods like spinach and red meat. Consult a doctor."
            ),
            "high": (
                "High MCHC may indicate spherocytosis or dehydration.",
                "Stay hydrated. Consult a hematologist for further evaluation."
            )
        },
        "Total Cholesterol": {
            "high": (
                "Cholesterol is important for cell membranes, but high levels may indicate a risk of heart disease, often due to diet or genetics.",
                "Adopt a low-fat diet (e.g., oats, nuts, avoid fried foods). Exercise regularly. Consult a cardiologist."
            )
        },
        "HDL": {
            "low": (
                "HDL is 'good' cholesterol that removes bad cholesterol. Low levels may indicate a higher risk of heart disease, often due to poor diet or lack of exercise.",
                "Increase healthy fats (e.g., avocados, olive oil) and exercise regularly. Consult a doctor."
            )
        },
        "LDL": {
            "high": (
                "LDL is 'bad' cholesterol that can build up in arteries. High levels may indicate a risk of heart disease, often due to diet or genetics.",
                "Reduce saturated fats (e.g., avoid butter, processed foods). Exercise regularly. Consult a cardiologist."
            )
        },
        "Triglycerides": {
            "high": (
                "Triglycerides are fats in the blood. High levels may indicate a risk of heart disease, often due to high sugar intake, alcohol, or obesity.",
                "Limit sugar and alcohol intake. Increase omega-3 intake (e.g., fish). Lose weight if needed. Consult a doctor."
            )
        },
        "ALT": {
            "high": (
                "ALT is a liver enzyme. High levels may indicate liver damage, often due to alcohol, fatty liver disease, or hepatitis.",
                "Avoid alcohol and fatty foods. Consult a hepatologist for liver health evaluation."
            )
        },
        "AST": {
            "high": (
                "AST is a liver enzyme. High levels may indicate liver damage, often due to alcohol, fatty liver disease, or hepatitis.",
                "Avoid alcohol and fatty foods. Consult a hepatologist for liver health evaluation."
            )
        },
        "ALP": {
            "high": (
                "ALP is an enzyme related to liver and bone health. High levels may indicate liver disease, bone disorders, or bile duct issues.",
                "Consult a hepatologist or bone specialist for further evaluation."
            )
        },
        "Bilirubin": {
            "high": (
                "Bilirubin is a byproduct of red blood cell breakdown. High levels may indicate liver dysfunction, bile duct obstruction, or hemolysis.",
                "Stay hydrated. Avoid alcohol. Consult a hepatologist for liver function evaluation."
            )
        },
        "Creatinine": {
            "high": (
                "Creatinine is a waste product filtered by the kidneys. High levels may indicate kidney dysfunction, often due to dehydration, high protein intake, or kidney disease.",
                "Reduce protein intake (e.g., limit red meat). Stay hydrated. Consult a nephrologist."
            )
        },
        "BUN": {
            "low": (
                "BUN measures kidney function and protein metabolism. Low levels may indicate malnutrition, liver disease, or overhydration.",
                "Ensure adequate protein intake (e.g., eggs, fish). Consult a doctor if persistent."
            ),
            "high": (
                "High BUN levels may indicate kidney dysfunction, dehydration, or high protein intake.",
                "Stay hydrated. Reduce protein intake. Consult a nephrologist."
            )
        },
        "Sodium": {
            "low": (
                "Sodium regulates fluid balance. Low levels may indicate dehydration, heart failure, or kidney issues.",
                "Increase sodium intake with foods like salted nuts or broth. Consult a doctor."
            ),
            "high": (
                "High sodium levels may indicate dehydration or kidney dysfunction.",
                "Stay hydrated. Reduce sodium intake. Consult a doctor."
            )
        },
        "Potassium": {
            "low": (
                "Potassium regulates nerve and muscle function. Low levels may indicate dehydration, diarrhea, or diuretic use.",
                "Increase potassium-rich foods (e.g., bananas, oranges). Consult a doctor."
            ),
            "high": (
                "High potassium levels may indicate kidney dysfunction or medication side effects.",
                "Reduce potassium intake (e.g., avoid bananas, oranges). Consult a doctor."
            )
        },
        "Fasting Sugar": {
            "high": (
                "Fasting sugar measures blood glucose. High levels may indicate diabetes or prediabetes, often due to poor diet or insulin resistance.",
                "Reduce refined carbs (e.g., white bread, sugary drinks). Exercise regularly. Consult a diabetologist."
            ),
            "low": (
                "Low fasting sugar may indicate hypoglycemia, often due to fasting, medication, or insulin issues.",
                "Eat small, frequent meals with complex carbs (e.g., whole grains). Consult a doctor."
            )
        },
        "HbA1c": {
            "borderline": (
                "HbA1c measures average blood sugar over 2-3 months. Borderline levels may indicate prediabetes, often due to poor diet or lack of exercise.",
                "Monitor blood sugar. Reduce refined carbs (e.g., white bread). Exercise regularly. Consult a diabetologist."
            ),
            "high": (
                "High HbA1c levels may indicate diabetes, often due to uncontrolled blood sugar.",
                "Follow a diabetic diet (e.g., low glycemic index foods). Consult a diabetologist."
            )
        },
        "TSH": {
            "low": (
                "TSH regulates thyroid function. Low levels may indicate hyperthyroidism, often due to an overactive thyroid or medication.",
                "Monitor symptoms like weight loss or anxiety. Consult an endocrinologist for thyroid evaluation."
            ),
            "high": (
                "High TSH levels may indicate hypothyroidism, often due to an underactive thyroid.",
                "Monitor symptoms like fatigue or weight gain. Consult an endocrinologist."
            )
        },
        "T3": {
            "low": (
                "T3 is a thyroid hormone. Low levels may indicate hypothyroidism or a thyroid disorder.",
                "Monitor symptoms like fatigue or weight gain. Consult an endocrinologist for thyroid evaluation."
            ),
            "high": (
                "High T3 levels may indicate hyperthyroidism.",
                "Monitor symptoms like weight loss or anxiety. Consult an endocrinologist."
            )
        },
        "T4": {
            "high": (
                "T4 is a thyroid hormone. High levels may indicate hyperthyroidism, often due to an overactive thyroid.",
                "Monitor symptoms like weight loss or anxiety. Consult an endocrinologist for thyroid evaluation."
            ),
            "low": (
                "Low T4 levels may indicate hypothyroidism.",
                "Monitor symptoms like fatigue or weight gain. Consult an endocrinologist."
            )
        }
    }
    return explanations_and_remedies.get(param, {}).get(flag.lower(), (
        f"{param} is out of range. This may indicate an underlying health issue.",
        f"Consult a doctor for further evaluation of {param}."
    ))

def analyze_blood_report(extracted_text):
    # Standard ranges for each parameter
    ranges = {
        "Hemoglobin": {"normal": (13.5, 17.5), "unit": "g/dL"},
        "WBC": {"normal": (4, 11), "unit": "x10^9/L"},
        "Platelets": {"normal": (150, 400), "unit": "x10^9/L"},
        "RBC": {"normal": (4.5, 5.9), "unit": "million/uL"},
        "Hematocrit": {"normal": (41, 53), "unit": "%"},
        "MCV": {"normal": (80, 100), "unit": "fL"},
        "MCH": {"normal": (27, 31), "unit": "pg"},
        "MCHC": {"normal": (32, 36), "unit": "g/dL"},
        "Total Cholesterol": {"normal": (0, 200), "unit": "mg/dL"},
        "HDL": {"normal": (40, 60), "unit": "mg/dL"},
        "LDL": {"normal": (0, 100), "unit": "mg/dL"},
        "Triglycerides": {"normal": (0, 150), "unit": "mg/dL"},
        "ALT": {"normal": (7, 56), "unit": "U/L"},
        "AST": {"normal": (10, 40), "unit": "U/L"},
        "ALP": {"normal": (44, 147), "unit": "U/L"},
        "Bilirubin": {"normal": (0.1, 1.2), "unit": "mg/dL"},
        "Creatinine": {"normal": (0.6, 1.2), "unit": "mg/dL"},
        "BUN": {"normal": (7, 20), "unit": "mg/dL"},
        "Sodium": {"normal": (135, 145), "unit": "mmol/L"},
        "Potassium": {"normal": (3.5, 5.0), "unit": "mmol/L"},
        "Fasting Sugar": {"normal": (70, 99), "unit": "mg/dL"},
        "HbA1c": {"normal": (4, 5.6), "unit": "%"},
        "TSH": {"normal": (0.4, 4.0), "unit": "mIU/L"},
        "T3": {"normal": (2.3, 4.2), "unit": ""},
        "T4": {"normal": (4.5, 12.0), "unit": ""}
    }

    # Parse extracted data into a list of (parameter, result, flag)
    data = parse_extracted_text(extracted_text)
    out_of_range = []
    risk_score = 0

    # Analyze each parameter
    for param, result, flag in data:
        if param in ranges:
            normal_range = ranges[param]["normal"]
            unit = ranges[param]["unit"]
            explanation = None
            remedy = None

            # Determine the actual status based on the value
            determined_flag = flag.lower()
            if result < normal_range[0]:
                determined_flag = "low"
                risk_score += 1
                explanation, remedy = get_explanation_and_remedy(param, result, "low")
            elif result > normal_range[1]:
                determined_flag = "high"
                risk_score += 2
                explanation, remedy = get_explanation_and_remedy(param, result, "high")
            elif flag.lower() == "borderline":
                determined_flag = "borderline"
                risk_score += 1
                explanation, remedy = get_explanation_and_remedy(param, result, "borderline")

            out_of_range.append({
                "parameter": param,
                "result": result,
                "unit": unit,
                "flag": determined_flag,
                "explanation": explanation,
                "remedy": remedy
            })

    # Determine overall risk level
    risk_level = "Low Risk"
    status = "Safe"
    if risk_score > 5:
        risk_level = "High Risk"
        status = "Need Attention"
    elif risk_score > 2:
        risk_level = "Moderate Risk"
        status = "Need Attention"

    logging.info(f"Risk Score: {risk_score}, Risk Level: {risk_level}, Status: {status}")
    return {
        "risk_level": risk_level,
        "status": status,
        "out_of_range": out_of_range
    }

@app.route("/process-file", methods=["POST"])
def process_file():
    file_path = None 
    try:
        file = request.files.get("file")
        if not file:
            logging.warning("No file uploaded.")
            return jsonify({"error": "No file uploaded"}), 400
        
        file_path = os.path.join("temp", file.filename)
        file.save(file_path)
        logging.info(f"File saved successfully: {file_path}")
        
        image = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(image, lang='eng')
        logging.info(f"Extracted Text: {extracted_text}")
        
        if not extracted_text.strip():
            logging.warning("No text extracted from the file.")
            return jsonify({"error": "No text extracted from the file."}), 400
        
        # Analyze the extracted text using the new logic
        prediction = analyze_blood_report(extracted_text)
        logging.info(f"Prediction: {prediction}")
        
        return jsonify({
            "extracted_text": extracted_text,
            "prediction": prediction
        })
    
    except Exception as e:
        logging.error(f"Error during processing: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Error during processing: {str(e)}"}), 500
    
    finally:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logging.info(f"Temporary file deleted: {file_path}")

if __name__ == "__main__":
    app.run(debug=True)
