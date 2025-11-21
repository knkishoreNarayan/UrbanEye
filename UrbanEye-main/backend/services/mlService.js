import axios from 'axios'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000'

/**
 * Analyze image using ML service for pothole detection and severity assessment
 * @param {string} base64Image - Base64 encoded image string
 * @returns {Promise<Object>} ML analysis results
 */
export async function analyzeImage(base64Image) {
  try {
    console.log('🔍 Sending image to ML service for analysis...')
    
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, {
      image: base64Image
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.success) {
      console.log('✅ ML analysis completed:', {
        detected: response.data.detected,
        type: response.data.detectionType,
        severity: response.data.suggestedSeverity,
        count: response.data.detectionCount
      })
      
      return {
        success: true,
        data: response.data
      }
    } else {
      console.error('❌ ML analysis failed:', response.data.error)
      return {
        success: false,
        error: response.data.error || 'Analysis failed'
      }
    }
  } catch (error) {
    console.error('❌ Error calling ML service:', error.message)
    
    // Return graceful fallback if ML service is unavailable
    return {
      success: false,
      error: error.message,
      fallback: true
    }
  }
}

/**
 * Check if ML service is available
 * @returns {Promise<boolean>}
 */
export async function checkMLServiceHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    })
    return response.data.status === 'healthy' && response.data.model_loaded
  } catch (error) {
    console.warn('⚠️ ML service health check failed:', error.message)
    return false
  }
}

/**
 * Process ML analysis results and format for database storage
 * @param {Object} mlResult - Raw ML service response
 * @returns {Object} Formatted ML analysis for database
 */
export function formatMLAnalysis(mlResult) {
  if (!mlResult.success || !mlResult.data) {
    return null
  }
  
  const data = mlResult.data
  
  return {
    detected: data.detected,
    detectionType: data.detectionType,
    detectionCount: data.detectionCount,
    confidence: data.detections && data.detections.length > 0 
      ? Math.max(...data.detections.map(d => d.confidence))
      : 0,
    suggestedSeverity: data.suggestedSeverity,
    suggestedCategory: data.suggestedCategory,
    severityScore: data.severityScore,
    reasoning: data.reasoning,
    boundingBoxes: data.detections ? data.detections.map(d => d.boundingBox) : [],
    metrics: data.metrics || {},
    processedAt: new Date(data.processedAt || Date.now())
  }
}

export default {
  analyzeImage,
  checkMLServiceHealth,
  formatMLAnalysis
}
