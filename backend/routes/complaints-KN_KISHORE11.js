import { Router } from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

// Memory storage for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter - Processing file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })
    if (file.mimetype.startsWith('image/')) {
      console.log('File accepted by multer')
      cb(null, true)
    } else {
      console.log('File rejected by multer - not an image')
      cb(new Error('Only image uploads are allowed'))
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

// Convert buffer to base64 data URL
function convertPhotoToDataUrl(buffer) {
  if (!buffer) {
    console.log('No buffer provided for photo conversion')
    return null
  }

  let actualBuffer = null
  
  // Handle different buffer types
  if (Buffer.isBuffer(buffer)) {
    actualBuffer = buffer
    console.log('Processing regular Buffer, length:', actualBuffer.length)
  } else if (buffer && typeof buffer === 'object' && buffer.buffer) {
    // Handle MongoDB Binary object
    actualBuffer = Buffer.from(buffer.buffer)
    console.log('Processing MongoDB Binary, length:', actualBuffer.length)
  } else if (buffer && typeof buffer === 'object' && buffer.toString) {
    // Try to convert other buffer-like objects
    try {
      actualBuffer = Buffer.from(buffer.toString('base64'), 'base64')
      console.log('Processing base64 string, length:', actualBuffer.length)
    } catch (error) {
      console.error('Failed to process buffer-like object:', error)
      return null
    }
  } else {
    console.log('Invalid buffer type for photo conversion:', typeof buffer, buffer?.constructor?.name)
    return null
  }
  
  try {
    // Determine MIME type based on buffer content
    let mimeType = 'image/jpeg' // default
    if (actualBuffer.length >= 4) {
      // Check for common image file signatures
      if (actualBuffer[0] === 0x89 && actualBuffer[1] === 0x50 && actualBuffer[2] === 0x4E && actualBuffer[3] === 0x47) {
        mimeType = 'image/png'
      } else if (actualBuffer[0] === 0xFF && actualBuffer[1] === 0xD8 && actualBuffer[2] === 0xFF) {
        mimeType = 'image/jpeg'
      } else if (actualBuffer[0] === 0x47 && actualBuffer[1] === 0x49 && actualBuffer[2] === 0x46) {
        mimeType = 'image/gif'
      } else if (actualBuffer[0] === 0x52 && actualBuffer[1] === 0x49 && actualBuffer[2] === 0x46 && actualBuffer[3] === 0x46) {
        mimeType = 'image/webp'
      }
    }
    
    const base64 = actualBuffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`
    console.log('Photo converted successfully, MIME type:', mimeType, 'Base64 length:', base64.length)
    return dataUrl
  } catch (error) {
    console.error('Error converting photo to data URL:', error)
    return null
  }
}

/* ================================
   GET /api/complaints
   Query params: division, userId, status, category, severity, search, page, limit
================================ */
router.get('/', async (req, res) => {
  try {
    const { 
      division, 
      userId, 
      status, 
      category, 
      severity, 
      search,
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    const filter = {}
    
    console.log('Complaints query params:', req.query)
    
    if (division) filter.division = division
    if (userId) {
      // Convert string ID to MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(userId)) {
        filter.userId = new mongoose.Types.ObjectId(userId)
        console.log('Filtering by userId:', filter.userId)
      } else {
        console.error('Invalid user ID format:', userId)
        return res.status(400).json({ error: 'Invalid user ID format' })
      }
    }
    if (status) filter.status = status
    if (category) filter.category = category
    if (severity) filter.severity = severity

    // Text search
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    console.log('Final filter:', filter)
    
    // Execute query with pagination
    const complaints = await Complaint.find(filter)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))

    console.log('Found complaints:', complaints.length)

    // Get total count for pagination
    const total = await Complaint.countDocuments(filter)
    console.log('Total complaints count:', total)

    // Convert photos to data URLs
    const complaintsWithPhotos = complaints.map(complaint => {
      const complaintObj = complaint.toJSON()
      if (complaintObj.photo) {
        console.log('Processing photo for complaint:', complaintObj.id, 'Type:', typeof complaintObj.photo, 'Constructor:', complaintObj.photo?.constructor?.name)
        const convertedPhoto = convertPhotoToDataUrl(complaintObj.photo)
        if (convertedPhoto) {
          complaintObj.photo = convertedPhoto
          console.log('Photo converted successfully, data URL length:', complaintObj.photo.length)
        } else {
          console.error('Failed to convert photo for complaint:', complaintObj.id)
          complaintObj.photo = null
        }
      } else {
        console.log('Complaint has no photo:', complaintObj.id)
      }
      return complaintObj
    })

    res.json({
      complaints: complaintsWithPhotos,
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
   Get single complaint by ID
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

    const complaintObj = complaint.toJSON()
    if (complaintObj.photo) {
      console.log('Processing single complaint photo:', complaintObj.id, 'Type:', typeof complaintObj.photo, 'Constructor:', complaintObj.photo?.constructor?.name)
      const convertedPhoto = convertPhotoToDataUrl(complaintObj.photo)
      if (convertedPhoto) {
        complaintObj.photo = convertedPhoto
        console.log('Single complaint photo converted successfully, length:', complaintObj.photo.length)
      } else {
        console.error('Failed to convert single complaint photo:', complaintObj.id)
        complaintObj.photo = null
      }
    } else {
      console.log('Single complaint has no photo:', complaintObj.id)
    }

    res.json({ complaint: complaintObj })
  } catch (error) {
    console.error('❌ GET complaint error:', error)
    res.status(500).json({ error: 'Failed to fetch complaint' })
  }
})

/* ================================
   POST /api/complaints
   Create new complaint (multipart/form-data)
   Fields: title, description, category, severity, location, division?, coordinates?
   File: photo (optional)
================================ */
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    console.log('POST /api/complaints - Request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      bodyKeys: Object.keys(req.body)
    })
    
    const { 
      title, 
      description, 
      category, 
      severity, 
      location, 
      division,
      coordinates,
      tags
    } = req.body

    // Validation
    if (!title || !description || !category || !severity || !location) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get user from token
    const user = await User.findById(req.user.sub)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

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
        }
      } catch (error) {
        console.warn('Invalid coordinates format:', error)
      }
    }

    // Parse tags if provided
    let parsedTags = []
    if (tags) {
      try {
        parsedTags = JSON.parse(tags)
      } catch (error) {
        console.warn('Invalid tags format:', error)
      }
    }

    // Create complaint data
    const complaintData = {
      title,
      description,
      category,
      severity,
      location,
      division: division || user.division || 'General',
      userId: user._id,
      coordinates: parsedCoordinates,
      tags: parsedTags
    }

    // Handle photo upload
    if (req.file) {
      console.log('Photo uploaded:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer.length,
        bufferType: typeof req.file.buffer,
        isBuffer: Buffer.isBuffer(req.file.buffer)
      })
      // Store the buffer directly in the database
      complaintData.photo = req.file.buffer
      console.log('Photo stored in complaintData:', {
        hasPhoto: !!complaintData.photo,
        photoType: typeof complaintData.photo,
        photoLength: complaintData.photo?.length
      })
    } else {
      console.log('No photo uploaded for complaint')
    }

    // Create complaint
    const complaint = new Complaint(complaintData)
    console.log('Complaint before save:', {
      hasPhoto: !!complaint.photo,
      photoType: typeof complaint.photo,
      photoLength: complaint.photo?.length
    })
    
    await complaint.save()
    
    console.log('Complaint after save:', {
      id: complaint._id,
      hasPhoto: !!complaint.photo,
      photoType: typeof complaint.photo,
      photoLength: complaint.photo?.length
    })

    // Populate user data
    await complaint.populate('userId', 'fullName email phone')

    res.status(201).json({ complaint: complaint.toJSON() })
  } catch (error) {
    console.error('❌ POST complaint error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: errors.join(', ') })
    }
    
    res.status(500).json({ error: 'Failed to create complaint' })
  }
})

/* ================================
   PATCH /api/complaints/:id/status
   Update complaint status (admin only)
================================ */
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes, resolutionNotes, assignedTo } = req.body

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' })
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Check division access
    if (req.user.division && complaint.division !== req.user.division) {
      return res.status(403).json({ error: 'Access denied for this division' })
    }

    // Update complaint status
    await complaint.updateStatus(status, adminNotes, assignedTo)

    // Add resolution notes if provided
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes
      await complaint.save()
    }

    // Populate user data
    await complaint.populate('userId', 'fullName email phone')
    await complaint.populate('assignedTo', 'fullName email')

    res.json({ complaint: complaint.toJSON() })
  } catch (error) {
    console.error('❌ PATCH complaint error:', error)
    res.status(500).json({ error: 'Failed to update complaint' })
  }
})

/* ================================
   PUT /api/complaints/:id
   Update complaint (owner or admin)
================================ */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category, severity, location, tags } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' })
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Check permissions
    const isOwner = complaint.userId.toString() === req.user.sub
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check admin division access
    if (isAdmin && req.user.division && complaint.division !== req.user.division) {
      return res.status(403).json({ error: 'Access denied for this division' })
    }

    // Update allowed fields
    if (title) complaint.title = title
    if (description) complaint.description = description
    if (category) complaint.category = category
    if (severity) complaint.severity = severity
    if (location) complaint.location = location
    if (tags) {
      try {
        complaint.tags = JSON.parse(tags)
      } catch (error) {
        return res.status(400).json({ error: 'Invalid tags format' })
      }
    }

    await complaint.save()

    // Populate user data
    await complaint.populate('userId', 'fullName email phone')
    await complaint.populate('assignedTo', 'fullName email')

    res.json({ complaint: complaint.toJSON() })
  } catch (error) {
    console.error('❌ PUT complaint error:', error)
    res.status(500).json({ error: 'Failed to update complaint' })
  }
})

/* ================================
   DELETE /api/complaints/:id
   Delete complaint (owner or admin)
================================ */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid complaint ID' })
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Check permissions
    const isOwner = complaint.userId.toString() === req.user.sub
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check admin division access
    if (isAdmin && req.user.division && complaint.division !== req.user.division) {
      return res.status(403).json({ error: 'Access denied for this division' })
    }

    await Complaint.findByIdAndDelete(id)

    res.json({ message: 'Complaint deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE complaint error:', error)
    res.status(500).json({ error: 'Failed to delete complaint' })
  }
})

/* ================================
   GET /api/complaints/stats/overview
   Get complaint statistics
================================ */
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { division } = req.query
    const filter = division ? { division } : {}

    // Get basic counts
    const total = await Complaint.countDocuments(filter)
    const byStatus = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    const byCategory = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])
    const bySeverity = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ])

    // Get recent complaints
    const recent = await Complaint.find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      recent
    })
  } catch (error) {
    console.error('❌ GET stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

export default router
