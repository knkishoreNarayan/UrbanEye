from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import io
from PIL import Image
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load the trained pothole detection model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
model = None

def load_model():
    global model
    try:
        model = YOLO(MODEL_PATH)
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

def base64_to_image(base64_string):
    """Convert base64 string to numpy array image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(img)
        return img_array
    except Exception as e:
        print(f"Error converting base64 to image: {e}")
        return None

def calculate_severity(detections, img_width, img_height):
    """Calculate severity based on detection results"""
    if not detections or len(detections) == 0:
        return {
            'severity': 'Low',
            'severityScore': 1,
            'reasoning': 'No significant damage detected'
        }
    
    # Calculate metrics
    total_area = img_width * img_height
    max_confidence = max([det['confidence'] for det in detections])
    count = len(detections)
    
    # Calculate total pothole area
    total_pothole_area = sum([det['area'] for det in detections])
    area_percentage = (total_pothole_area / total_area) * 100
    
    # Get largest pothole
    largest_pothole = max(detections, key=lambda x: x['area'])
    max_area = largest_pothole['area']
    max_area_percentage = (max_area / total_area) * 100
    
    # Severity calculation logic
    severity_score = 0
    reasoning_parts = []
    
    # Factor 1: Area coverage
    if area_percentage > 15:
        severity_score += 4
        reasoning_parts.append(f"Large area coverage ({area_percentage:.1f}%)")
    elif area_percentage > 8:
        severity_score += 3
        reasoning_parts.append(f"Moderate area coverage ({area_percentage:.1f}%)")
    elif area_percentage > 3:
        severity_score += 2
        reasoning_parts.append(f"Small area coverage ({area_percentage:.1f}%)")
    else:
        severity_score += 1
        reasoning_parts.append(f"Minimal area coverage ({area_percentage:.1f}%)")
    
    # Factor 2: Number of potholes
    if count >= 5:
        severity_score += 3
        reasoning_parts.append(f"Multiple potholes detected ({count})")
    elif count >= 3:
        severity_score += 2
        reasoning_parts.append(f"Several potholes detected ({count})")
    elif count >= 2:
        severity_score += 1
        reasoning_parts.append(f"Two potholes detected")
    
    # Factor 3: Confidence
    if max_confidence > 0.8:
        severity_score += 1
        reasoning_parts.append(f"High confidence detection ({max_confidence:.0%})")
    
    # Factor 4: Individual pothole size
    if max_area_percentage > 10:
        severity_score += 2
        reasoning_parts.append(f"Very large individual pothole ({max_area_percentage:.1f}%)")
    elif max_area_percentage > 5:
        severity_score += 1
        reasoning_parts.append(f"Large individual pothole ({max_area_percentage:.1f}%)")
    
    # Determine severity level
    if severity_score >= 8:
        severity = 'Critical'
    elif severity_score >= 5:
        severity = 'High'
    elif severity_score >= 3:
        severity = 'Medium'
    else:
        severity = 'Low'
    
    reasoning = '; '.join(reasoning_parts)
    
    return {
        'severity': severity,
        'severityScore': severity_score,
        'reasoning': reasoning,
        'metrics': {
            'totalArea': total_pothole_area,
            'areaPercentage': round(area_percentage, 2),
            'maxConfidence': round(max_confidence, 2),
            'count': count
        }
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Analyze image for pothole detection and severity assessment"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        # Convert base64 to image
        img_array = base64_to_image(data['image'])
        if img_array is None:
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400
        
        img_height, img_width = img_array.shape[:2]
        
        # Run YOLO inference
        results = model(img_array, conf=0.25)  # 25% confidence threshold
        
        # Process detections
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                
                # Calculate area
                width = x2 - x1
                height = y2 - y1
                area = width * height
                
                detection = {
                    'type': 'pothole',
                    'confidence': confidence,
                    'boundingBox': {
                        'x1': float(x1),
                        'y1': float(y1),
                        'x2': float(x2),
                        'y2': float(y2),
                        'width': float(width),
                        'height': float(height)
                    },
                    'area': float(area),
                    'classId': class_id
                }
                detections.append(detection)
        
        # Calculate severity
        severity_result = calculate_severity(detections, img_width, img_height)
        
        # Determine category
        if len(detections) > 0:
            suggested_category = 'Roads'
            detection_type = 'pothole'
        else:
            suggested_category = 'Other'
            detection_type = 'none'
        
        # Prepare response
        response = {
            'success': True,
            'detected': len(detections) > 0,
            'detectionType': detection_type,
            'detectionCount': len(detections),
            'detections': detections,
            'suggestedCategory': suggested_category,
            'suggestedSeverity': severity_result['severity'],
            'severityScore': severity_result['severityScore'],
            'reasoning': severity_result['reasoning'],
            'metrics': severity_result.get('metrics', {}),
            'imageSize': {
                'width': img_width,
                'height': img_height
            },
            'processedAt': datetime.now().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({
        'message': 'ML Service is running',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH
    })

if __name__ == '__main__':
    print("🚀 Starting ML Service...")
    print(f"📁 Model path: {MODEL_PATH}")
    
    # Load model on startup
    if load_model():
        print("✅ ML Service ready")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("❌ Failed to load model. Please check the model path.")
        print(f"Expected model at: {MODEL_PATH}")
