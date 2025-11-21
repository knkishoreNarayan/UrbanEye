import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Roads',
      'Street Lighting',
      'Water Supply',
      'Drainage',
      'Waste Management',
      'Public Transport',
      'Parks & Recreation',
      'Traffic',
      'Electricity',
      'Other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
    default: 'Pending'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  division: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  photo: {
    type: String, // Store as base64 string
    required: false
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  estimatedResolution: {
    type: Date
  },
  actualResolution: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  attachments: [{
    filename: String,
    fileId: String, // GridFS file ID
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mlAnalysis: {
    detected: {
      type: Boolean,
      default: false
    },
    detectionType: {
      type: String,
      enum: ['pothole', 'garbage', 'none', 'other'],
      default: 'none'
    },
    detectionCount: {
      type: Number,
      default: 0
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    suggestedSeverity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    suggestedCategory: {
      type: String
    },
    severityScore: {
      type: Number,
      min: 0,
      max: 10
    },
    reasoning: {
      type: String,
      trim: true
    },
    boundingBoxes: [{
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number,
      width: Number,
      height: Number
    }],
    metrics: {
      totalArea: Number,
      areaPercentage: Number,
      maxConfidence: Number,
      count: Number
    },
    processedAt: {
      type: Date
    },
    mlServiceAvailable: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Indexes for efficient queries
complaintSchema.index({ userId: 1 })
complaintSchema.index({ division: 1 })
complaintSchema.index({ status: 1 })
complaintSchema.index({ category: 1 })
complaintSchema.index({ severity: 1 })
complaintSchema.index({ createdAt: -1 })
complaintSchema.index({ coordinates: '2dsphere' }) // Geospatial index

// Text search index
complaintSchema.index({
  title: 'text',
  description: 'text',
  location: 'text'
})


// Method to update status with admin notes
complaintSchema.methods.updateStatus = function(newStatus, adminNotes = '', adminId = null) {
  this.status = newStatus
  this.adminNotes = adminNotes
  if (adminId) {
    this.assignedTo = adminId
  }
  
  if (newStatus === 'Resolved' && !this.actualResolution) {
    this.actualResolution = new Date()
  }
  
  return this.save()
}

// Method to add attachment
complaintSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData)
  return this.save()
}

// Static method to get complaints by division
complaintSchema.statics.getByDivision = function(division, options = {}) {
  const query = { division }
  
  if (options.status) {
    query.status = options.status
  }
  
  if (options.category) {
    query.category = options.category
  }
  
  if (options.severity) {
    query.severity = options.severity
  }
  
  return this.find(query)
    .populate('userId', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
}

// Static method to search complaints
complaintSchema.statics.search = function(searchTerm, filters = {}) {
  const query = {}
  
  if (searchTerm) {
    query.$text = { $search: searchTerm }
  }
  
  if (filters.status) {
    query.status = filters.status
  }
  
  if (filters.category) {
    query.category = filters.category
  }
  
  if (filters.severity) {
    query.severity = filters.severity
  }
  
  if (filters.division) {
    query.division = filters.division
  }
  
  if (filters.userId) {
    query.userId = filters.userId
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {}
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo)
    }
  }
  
  return this.find(query)
    .populate('userId', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .sort({ createdAt: -1 })
}

const Complaint = mongoose.model('Complaint', complaintSchema)

export default Complaint
