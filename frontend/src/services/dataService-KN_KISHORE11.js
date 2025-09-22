// Data persistence service using MongoDB API
// This service now connects to the MongoDB backend API

import { sendComplaintNotification } from '../components/NotificationSystem'
import apiService from './apiService'

const STORAGE_KEYS = {
  USERS: 'urbanEye_users',
  ADMINS: 'urbanEye_admins',
  COMPLAINTS: 'urbanEye_complaints',
  SETTINGS: 'urbanEye_settings'
}

class DataService {
  constructor() {
    this.initialized = false
  }

  // Lazy initialization - only initialize when data is first accessed
  ensureInitialized() {
    if (this.initialized) return
    
    this.initializeData()
    this.initialized = true
  }

  // Initialize default data if not exists
  initializeData() {
    // Check if any data exists first to avoid unnecessary operations
    const hasUsers = localStorage.getItem(STORAGE_KEYS.USERS)
    const hasAdmins = localStorage.getItem(STORAGE_KEYS.ADMINS)
    const hasComplaints = localStorage.getItem(STORAGE_KEYS.COMPLAINTS)

    if (!hasUsers) {
      this.setUsers([
        {
          id: 1,
          email: 'user@example.com',
          password: 'password123',
          fullName: 'John Doe',
          phone: '+91 9876543210',
          address: 'Koramangala, Bengaluru',
          createdAt: new Date().toISOString()
        }
      ])
    }

    if (!hasAdmins) {
      this.setAdmins([
        {
          id: 1,
          email: 'admin@bengaluru.gov.in',
          password: 'admin123',
          fullName: 'Admin User',
          division: 'Koramangala',
          accessCode: 'ADMIN001',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          email: 'admin@bbmp.gov.in',
          password: 'admin@1234',
          fullName: 'BBMP Admin',
          division: 'Koramangala',
          accessCode: 'BBMP001',
          createdAt: new Date().toISOString()
        }
      ])
    }

    if (!hasComplaints) {
      this.setComplaints([
        {
          id: 1,
          title: 'Pothole on Main Road',
          description: 'Large pothole causing traffic issues',
          category: 'Roads',
          severity: 'High',
          status: 'Pending',
          location: 'Koramangala 5th Block',
          userId: 1,
          division: 'Koramangala',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          photo: null
        },
        {
          id: 2,
          title: 'Street Light Not Working',
          description: 'Street light has been out for 3 days',
          category: 'Street Lighting',
          severity: 'Medium',
          status: 'In Progress',
          location: 'BTM Layout',
          userId: 1,
          division: 'BTM',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          photo: null
        }
      ])
    }
  }

  // Generic storage methods
  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error)
      return []
    }
  }

  setToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error)
      return false
    }
  }

  // User methods - Now using MongoDB API
  async getUsers() {
    try {
      const response = await apiService.getUsers()
      return response.users || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  async addUser(userData) {
    try {
      const response = await apiService.signup(userData)
      return response.user
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  async getUserById(id) {
    try {
      const response = await apiService.getUserById(id)
      return response.user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await apiService.getUserByEmail(email)
      return response.user
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await apiService.updateUser(id, userData)
      return response.user
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async deleteUser(id) {
    try {
      await apiService.deleteUser(id)
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  // Admin methods - Now using MongoDB API
  async getAdmins() {
    try {
      const response = await apiService.getAdmins()
      return response.admins || []
    } catch (error) {
      console.error('Error fetching admins:', error)
      return []
    }
  }

  async addAdmin(adminData) {
    try {
      const response = await apiService.signup({ ...adminData, role: 'admin' })
      return response.user
    } catch (error) {
      console.error('Error adding admin:', error)
      throw error
    }
  }

  async getAdminById(id) {
    try {
      const response = await apiService.getUserById(id)
      return response.user?.role === 'admin' ? response.user : null
    } catch (error) {
      console.error('Error fetching admin:', error)
      return null
    }
  }

  async getAdminByEmail(email) {
    try {
      const response = await apiService.getUserByEmail(email)
      return response.user?.role === 'admin' ? response.user : null
    } catch (error) {
      console.error('Error fetching admin by email:', error)
      return null
    }
  }

  async updateAdmin(id, adminData) {
    try {
      const response = await apiService.updateUser(id, adminData)
      return response.user
    } catch (error) {
      console.error('Error updating admin:', error)
      throw error
    }
  }

  async deleteAdmin(id) {
    try {
      await apiService.deleteUser(id)
      return true
    } catch (error) {
      console.error('Error deleting admin:', error)
      return false
    }
  }

  // Complaint methods - Now using MongoDB API
  async getComplaints(filters = {}) {
    try {
      const response = await apiService.listComplaints(filters)
      return response.complaints || []
    } catch (error) {
      console.error('Error fetching complaints:', error)
      return []
    }
  }

  async addComplaint(complaintData) {
    try {
      const response = await apiService.createComplaint(complaintData)
      const newComplaint = response.complaint
      
      // Send notification to user
      try {
        const user = await this.getUserById(newComplaint.userId)
        if (user) {
          await sendComplaintNotification(user, newComplaint, 'complaintSubmitted')
        }
      } catch (error) {
        console.error('Failed to send complaint submission notification:', error)
      }
      
      return newComplaint
    } catch (error) {
      console.error('Error adding complaint:', error)
      throw error
    }
  }

  async getComplaintById(id) {
    try {
      const response = await apiService.getComplaintById(id)
      return response.complaint
    } catch (error) {
      console.error('Error fetching complaint:', error)
      return null
    }
  }

  async getComplaintsByUserId(userId) {
    try {
      const response = await apiService.listComplaints({ userId })
      return response.complaints || []
    } catch (error) {
      console.error('Error fetching user complaints:', error)
      return []
    }
  }

  async getComplaintsByDivision(division) {
    try {
      const response = await apiService.listComplaints({ division })
      return response.complaints || []
    } catch (error) {
      console.error('Error fetching division complaints:', error)
      return []
    }
  }

  async updateComplaint(id, complaintData) {
    try {
      const response = await apiService.updateComplaint(id, complaintData)
      const updatedComplaint = response.complaint
      
      // Send notification if status changed
      try {
        if (complaintData.status && complaintData.previousStatus && 
            complaintData.status !== complaintData.previousStatus) {
          const user = await this.getUserById(updatedComplaint.userId)
          if (user) {
            await sendComplaintNotification(user, updatedComplaint, 'statusUpdate')
          }
        }
      } catch (error) {
        console.error('Failed to send status update notification:', error)
      }
      
      return updatedComplaint
    } catch (error) {
      console.error('Error updating complaint:', error)
      throw error
    }
  }

  async updateComplaintStatus(id, status, adminNotes = '') {
    try {
      const response = await apiService.updateComplaintStatus(id, { status, adminNotes })
      return response.complaint
    } catch (error) {
      console.error('Error updating complaint status:', error)
      throw error
    }
  }

  async deleteComplaint(id) {
    try {
      await apiService.deleteComplaint(id)
      return true
    } catch (error) {
      console.error('Error deleting complaint:', error)
      return false
    }
  }

  // Search and filter methods - Now using MongoDB API
  async searchComplaints(query, filters = {}) {
    try {
      const searchFilters = { ...filters }
      if (query) {
        searchFilters.search = query
      }
      const response = await apiService.listComplaints(searchFilters)
      return response.complaints || []
    } catch (error) {
      console.error('Error searching complaints:', error)
      return []
    }
  }

  // Statistics methods - Now using MongoDB API
  async getComplaintStats(filters = {}) {
    try {
      const response = await apiService.getComplaintStats(filters)
      return response
    } catch (error) {
      console.error('Error fetching complaint stats:', error)
      return {
        total: 0,
        byStatus: {},
        bySeverity: {},
        byCategory: {},
        byDivision: {},
        recent: []
      }
    }
  }

  // Settings methods
  getSettings() {
    return this.getFromStorage(STORAGE_KEYS.SETTINGS)
  }

  setSetting(key, value) {
    const settings = this.getSettings()
    settings[key] = value
    return this.setToStorage(STORAGE_KEYS.SETTINGS, settings)
  }

  getSetting(key, defaultValue = null) {
    const settings = this.getSettings()
    return settings[key] !== undefined ? settings[key] : defaultValue
  }

  // Backup and restore methods
  exportData() {
    return {
      users: this.getUsers(),
      admins: this.getAdmins(),
      complaints: this.getComplaints(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    }
  }

  importData(data) {
    try {
      if (data.users) this.setUsers(data.users)
      if (data.admins) this.setAdmins(data.admins)
      if (data.complaints) this.setComplaints(data.complaints)
      if (data.settings) this.setToStorage(STORAGE_KEYS.SETTINGS, data.settings)
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  // Clear all data
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    this.initializeData()
  }

  // Notification integration methods
  async sendTestNotification(userId) {
    try {
      const user = this.getUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const testComplaint = {
        id: 'TEST-' + Date.now(),
        title: 'Test Notification',
        category: 'System Test',
        priority: 'Medium',
        location: 'Test Location',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        userId: userId
      }

      // Use global notification function if available
      if (window.testNotifications) {
        return await window.testNotifications(user)
      } else {
        return await sendComplaintNotification(user, testComplaint, 'complaintSubmitted')
      }
    } catch (error) {
      console.error('Test notification failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Bulk notification methods
  async notifyAllUsersWithPendingComplaints() {
    try {
      const complaints = this.getComplaints().filter(c => c.status === 'Pending')
      const results = []

      for (const complaint of complaints) {
        const user = this.getUserById(complaint.userId)
        if (user) {
          try {
            const result = await sendComplaintNotification(user, complaint, 'statusUpdate')
            results.push({ complaintId: complaint.id, success: true, result })
          } catch (error) {
            results.push({ complaintId: complaint.id, success: false, error: error.message })
          }
        }
      }

      return {
        success: true,
        totalProcessed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    } catch (error) {
      console.error('Bulk notification failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Get notification preferences
  getNotificationPreferences(userId) {
    const settings = this.getSettings()
    return settings[`notifications_${userId}`] || {
      sms: true,
      email: true,
      statusUpdates: true,
      reminders: true
    }
  }

  // Set notification preferences
  setNotificationPreferences(userId, preferences) {
    return this.setSetting(`notifications_${userId}`, preferences)
  }

  // Analytics for notifications
  getNotificationStats() {
    const settings = this.getSettings()
    const notificationKeys = Object.keys(settings).filter(key => key.startsWith('notifications_'))
    
    return {
      totalUsers: notificationKeys.length,
      smsEnabled: notificationKeys.filter(key => settings[key].sms).length,
      emailEnabled: notificationKeys.filter(key => settings[key].email).length,
      statusUpdatesEnabled: notificationKeys.filter(key => settings[key].statusUpdates).length,
      remindersEnabled: notificationKeys.filter(key => settings[key].reminders).length
    }
  }
}

// Create singleton instance
const dataService = new DataService()

export default dataService