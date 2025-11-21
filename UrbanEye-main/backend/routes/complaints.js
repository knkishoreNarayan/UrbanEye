import { Router } from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { analyzeImage, formatMLAnalysis, checkMLServiceHealth } from '../services/mlService.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}


/* ================================
   GET /api/complaints
================================ */
router.get('/', async (req, res) => {
  try {
    const { 
      division = null, 
      userId = null, 
      status = null, 
      category = null, 
      severity = null,
      page = 1, 
      limit = 10,
      search = null 
    } = req.query

    // Build query
    const query = {}
    
    if (division) query.division = division
    if (userId) query.userId = new mongoose.Types.ObjectId(userId)
    if (status) query.status = status
    if (category) query.category = category
    if (severity) query.severity = severity

    // Text search
    if (search) {
      query.$text = { $search: search }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Execute query
    const complaints = await Complaint.find(query)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const total = await Complaint.countDocuments(query)

    res.json({ 
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('❌ GET complaints error:', error)
    res.status(500).json({ error: 'Failed to fetch complaints' })
  }
})

/* ================================
   GET /api/complaints/:id
================================ */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' })
    }

    const complaint = await Complaint.findById(id)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    res.json({ complaint })
  } catch (error) {
    console.error('❌ GET complaint error:', error)
    res.status(500).json({ error: 'Failed to fetch complaint' })
  }
})

/* ================================
   POST /api/complaints
   Fields: title, description, category, severity, location, division?, userId
   File: photo (optional)
================================ */
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    console.log('📝 POST /api/complaints - Request received')
    console.log('Request body:', req.body)
    console.log('Request file:', req.file ? 'File present' : 'No file')
    
    const { title, description, category, severity, location, userId, division, coordinates } = req.body
    
    if (!title || !description || !category || !severity || !location || !userId) {
      console.log('❌ Missing required fields:', { title, description, category, severity, location, userId })
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate user exists
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Invalid user ID:', userId)
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    console.log('🔍 Looking for user with ID:', userId)
    const user = await User.findById(userId)
    if (!user) {
      console.log('❌ User not found:', userId)
      return res.status(404).json({ error: 'User not found' })
    }

    console.log('✅ User found:', user.email)

    // Parse coordinates if provided
    let parsedCoordinates = null
    if (coordinates) {
      try {
        const coords = JSON.parse(coordinates)
        if (coords.lat && coords.lng) {
          parsedCoordinates = {
            type: 'Point',
            coordinates: [coords.lng, coords.lat] // MongoDB expects [lng, lat]
          }
          console.log('✅ GPS coordinates parsed:', parsedCoordinates)
        }
      } catch (error) {
        console.warn('⚠️ Invalid coordinates format:', error)
      }
    }

    // Convert photo to base64 if present
    let photoBase64 = null
    if (req.file) {
      photoBase64 = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`
    }

    // ML Analysis - Analyze photo if present
    let mlAnalysisData = null
    let finalSeverity = severity
    let finalCategory = category

    if (photoBase64) {
      console.log('🤖 Running ML analysis on uploaded photo...')
      try {
        const mlResult = await analyzeImage(photoBase64)
        
        if (mlResult.success && mlResult.data) {
          mlAnalysisData = formatMLAnalysis(mlResult)
          
          // Use ML suggested severity if detected
          if (mlAnalysisData.detected && mlAnalysisData.suggestedSeverity) {
            finalSeverity = mlAnalysisData.suggestedSeverity
            console.log(`✅ ML detected ${mlAnalysisData.detectionType} with ${finalSeverity} severity`)
          }
          
          // Use ML suggested category if detected
          if (mlAnalysisData.suggestedCategory) {
            finalCategory = mlAnalysisData.suggestedCategory
          }
        } else {
          console.warn('⚠️ ML analysis failed, using user-provided values')
          mlAnalysisData = {
            detected: false,
            detectionType: 'none',
            mlServiceAvailable: false
          }
        }
      } catch (error) {
        console.error('❌ ML analysis error:', error.message)
        mlAnalysisData = {
          detected: false,
          detectionType: 'none',
          mlServiceAvailable: false
        }
      }
    }

    // Create complaint with ML analysis
    const complaintData = {
      title,
      description,
      category: finalCategory,
      severity: finalSeverity,
      location,
      division: division || null,
      userId: new mongoose.Types.ObjectId(userId),
      photo: photoBase64,
      coordinates: parsedCoordinates,
      mlAnalysis: mlAnalysisData
    }

    const complaint = new Complaint(complaintData)

    console.log('💾 Saving complaint...')
    await complaint.save()
    console.log('✅ Complaint saved with ID:', complaint._id)

    // Populate user data
    await complaint.populate('userId', 'fullName email phone')

    res.status(201).json({ complaint })
  } catch (error) {
    console.error('❌ POST complaint error:', error)
    console.error('Error stack:', error.stack)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: errors.join(', ') })
    }
    
    res.status(500).json({ error: 'Failed to create complaint', details: error.message })
  }
})

/* ================================
   PATCH /api/complaints/:id/status
================================ */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes, assignedTo } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' })
    }

    const updateData = { status }
    if (adminNotes) updateData.adminNotes = adminNotes
    if (assignedTo) updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo)

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    res.json({ complaint })
  } catch (error) {
    console.error('❌ PATCH complaint error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: errors.join(', ') })
    }
    
    res.status(500).json({ error: 'Failed to update complaint' })
  }
})

/* ================================
   DELETE /api/complaints/:id
================================ */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' })
    }

    const complaint = await Complaint.findByIdAndDelete(id)

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    res.json({ message: 'Complaint deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE complaint error:', error)
    res.status(500).json({ error: 'Failed to delete complaint' })
  }
})

/* ================================
   GET /api/complaints/stats/overview
================================ */
router.get('/stats/overview', async (req, res) => {
  try {
    const { division = null } = req.query

    const matchStage = {}
    if (division) {
      matchStage.division = division
    }

    const stats = await Complaint.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
        }
      }
    ])

    const categoryStats = await Complaint.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    const severityStats = await Complaint.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    res.json({
      overview: stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        closed: 0
      },
      byCategory: categoryStats,
      bySeverity: severityStats
    })
  } catch (error) {
    console.error('❌ GET stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

export default router
