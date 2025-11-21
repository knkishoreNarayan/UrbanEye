"""
Test script for ML Service
Tests the pothole detection API with sample images
"""

import requests
import base64
import json
import os
from pathlib import Path

ML_SERVICE_URL = "http://localhost:5000"

def test_health_check():
    """Test health check endpoint"""
    print("\n🔍 Testing health check...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health", timeout=5)
        print(f"✅ Health check: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_with_image(image_path):
    """Test ML analysis with an actual image"""
    print(f"\n🔍 Testing with image: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    try:
        # Read and encode image
        with open(image_path, 'rb') as f:
            image_data = f.read()
            base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Add data URL prefix
        base64_with_prefix = f"data:image/jpeg;base64,{base64_image}"
        
        # Send to ML service
        print("📤 Sending image to ML service...")
        response = requests.post(
            f"{ML_SERVICE_URL}/analyze",
            json={"image": base64_with_prefix},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print(f"\n📊 Results:")
            print(f"  Detected: {result.get('detected')}")
            print(f"  Type: {result.get('detectionType')}")
            print(f"  Count: {result.get('detectionCount')}")
            print(f"  Suggested Severity: {result.get('suggestedSeverity')}")
            print(f"  Severity Score: {result.get('severityScore')}")
            print(f"  Reasoning: {result.get('reasoning')}")
            
            if result.get('detections'):
                print(f"\n🎯 Detections:")
                for i, det in enumerate(result['detections'], 1):
                    print(f"  Detection {i}:")
                    print(f"    Confidence: {det['confidence']:.2%}")
                    print(f"    Area: {det['area']:.0f} pixels")
                    print(f"    Box: ({det['boundingBox']['x1']:.0f}, {det['boundingBox']['y1']:.0f}) to ({det['boundingBox']['x2']:.0f}, {det['boundingBox']['y2']:.0f})")
            
            return True
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def find_test_images():
    """Find test images in the pothole detection dataset"""
    test_dirs = [
        "../pothole-detection-1/valid/images",
        "../pothole-detection-1/train/images",
        "./test_images"
    ]
    
    for test_dir in test_dirs:
        if os.path.exists(test_dir):
            images = list(Path(test_dir).glob("*.jpg")) + list(Path(test_dir).glob("*.png"))
            if images:
                return images[:3]  # Return first 3 images
    
    return []

def main():
    print("=" * 60)
    print("🧪 ML Service Test Suite")
    print("=" * 60)
    
    # Test 1: Health check
    if not test_health_check():
        print("\n❌ ML service is not running or not healthy")
        print("Please start the ML service first: python app.py")
        return
    
    print("\n✅ ML service is healthy and ready")
    
    # Test 2: Find and test with actual images
    test_images = find_test_images()
    
    if not test_images:
        print("\n⚠️ No test images found")
        print("Please provide a test image path manually")
        image_path = input("Enter image path (or press Enter to skip): ").strip()
        if image_path:
            test_with_image(image_path)
    else:
        print(f"\n📸 Found {len(test_images)} test images")
        for img_path in test_images:
            test_with_image(str(img_path))
            print("\n" + "-" * 60)
    
    print("\n" + "=" * 60)
    print("✅ Test suite completed")
    print("=" * 60)

if __name__ == "__main__":
    main()
