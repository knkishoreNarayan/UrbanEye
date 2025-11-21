# ML Service - Pothole Detection & Severity Assessment

This service provides AI-powered pothole detection and severity assessment for the UrbanEye application.

## Features

- **Pothole Detection**: Uses YOLOv8 trained model to detect potholes in images
- **Severity Assessment**: Automatically calculates severity (Low/Medium/High/Critical) based on:
  - Pothole size and area coverage
  - Number of potholes detected
  - Detection confidence
  - Individual pothole dimensions
- **REST API**: Flask-based API for easy integration

## Setup

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Copy Trained Model

Copy your trained model to the models directory:

```bash
mkdir models
cp ../runs/detect/train/weights/best.pt models/
```

### 3. Run the Service

```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-01T12:00:00"
}
```

### Analyze Image
```
POST /analyze
Content-Type: application/json

{
  "image": "base64_encoded_image_string"
}
```

Response:
```json
{
  "success": true,
  "detected": true,
  "detectionType": "pothole",
  "detectionCount": 2,
  "detections": [
    {
      "type": "pothole",
      "confidence": 0.92,
      "boundingBox": {
        "x1": 100,
        "y1": 150,
        "x2": 300,
        "y2": 250,
        "width": 200,
        "height": 100
      },
      "area": 20000
    }
  ],
  "suggestedCategory": "Roads",
  "suggestedSeverity": "High",
  "severityScore": 7,
  "reasoning": "Large area coverage (5.2%); Multiple potholes detected (2); High confidence detection (92%)",
  "metrics": {
    "totalArea": 25000,
    "areaPercentage": 5.2,
    "maxConfidence": 0.92,
    "count": 2
  },
  "processedAt": "2024-01-01T12:00:00"
}
```

## Severity Calculation

The severity is calculated based on multiple factors:

- **Critical (8+ points)**: Large area coverage, multiple potholes, high confidence
- **High (5-7 points)**: Moderate area coverage, several potholes
- **Medium (3-4 points)**: Small area coverage, few potholes
- **Low (1-2 points)**: Minimal damage detected

## Testing

Test the service:
```bash
curl http://localhost:5000/health
```

## Integration with Node.js Backend

The Node.js backend will call this service via HTTP when a complaint is submitted with a photo.
