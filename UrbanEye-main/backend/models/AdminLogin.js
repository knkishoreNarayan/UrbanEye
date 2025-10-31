import mongoose from 'mongoose'

const adminLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  division: {
    type: String,
    required: true,
    trim: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date
  },
  sessionDuration: {
    type: Number // in minutes
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
adminLoginSchema.index({ email: 1 })
adminLoginSchema.index({ division: 1 })
adminLoginSchema.index({ adminId: 1 })
adminLoginSchema.index({ loginTime: -1 })
adminLoginSchema.index({ isActive: 1 })

// Method to end session
adminLoginSchema.methods.endSession = function() {
  this.logoutTime = new Date()
  this.isActive = false
  
  if (this.loginTime) {
    this.sessionDuration = Math.round((this.logoutTime - this.loginTime) / (1000 * 60))
  }
  
  return this.save()
}

// Static method to get active sessions
adminLoginSchema.statics.getActiveSessions = function() {
  return this.find({ isActive: true })
    .populate('adminId', 'fullName email division')
    .sort({ loginTime: -1 })
}

// Static method to get login statistics
adminLoginSchema.statics.getLoginStats = function(division = null, dateRange = null) {
  const matchStage = {}
  
  if (division) {
    matchStage.division = division
  }
  
  if (dateRange) {
    matchStage.loginTime = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          division: '$division',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$loginTime' } }
        },
        totalLogins: { $sum: 1 },
        uniqueAdmins: { $addToSet: '$adminId' }
      }
    },
    {
      $project: {
        division: '$_id.division',
        date: '$_id.date',
        totalLogins: 1,
        uniqueAdmins: { $size: '$uniqueAdmins' }
      }
    },
    { $sort: { date: -1 } }
  ])
}

const AdminLogin = mongoose.model('AdminLogin', adminLoginSchema)

export default AdminLogin
