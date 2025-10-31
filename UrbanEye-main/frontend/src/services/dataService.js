// Data persistence service using localStorage
// In a production app, this would connect to a real database/API

import { sendComplaintNotification } from '../components/NotificationSystem'

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

  // User methods
  getUsers() {
    this.ensureInitialized()
    return this.getFromStorage(STORAGE_KEYS.USERS)
  }

  setUsers(users) {
    return this.setToStorage(STORAGE_KEYS.USERS, users)
  }

  addUser(userData) {
    const users = this.getUsers()
    const newUser = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    this.setUsers(users)
    return newUser
  }

  getUserById(id) {
    const users = this.getUsers()
    return users.find(user => user.id === id)
  }

  getUserByEmail(email) {
    const users = this.getUsers()
    return users.find(user => user.email === email)
  }

  updateUser(id, userData) {
    const users = this.getUsers()
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...userData,
        updatedAt: new Date().toISOString()
      }
      this.setUsers(users)
      return users[index]
    }
    return null
  }

  deleteUser(id) {
    const users = this.getUsers()
    const filteredUsers = users.filter(user => user.id !== id)
    this.setUsers(filteredUsers)
    return filteredUsers.length < users.length
  }

  // Admin methods
  getAdmins() {
    this.ensureInitialized()
    return this.getFromStorage(STORAGE_KEYS.ADMINS)
  }

  setAdmins(admins) {
    return this.setToStorage(STORAGE_KEYS.ADMINS, admins)
  }

  addAdmin(adminData) {
    const admins = this.getAdmins()
    const newAdmin = {
      ...adminData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    admins.push(newAdmin)
    this.setAdmins(admins)
    return newAdmin
  }

  getAdminById(id) {
    const admins = this.getAdmins()
    return admins.find(admin => admin.id === id)
  }

  getAdminByEmail(email) {
    const admins = this.getAdmins()
    return admins.find(admin => admin.email === email)
  }

  updateAdmin(id, adminData) {
    const admins = this.getAdmins()
    const index = admins.findIndex(admin => admin.id === id)
    if (index !== -1) {
      admins[index] = {
        ...admins[index],
        ...adminData,
        updatedAt: new Date().toISOString()
      }
      this.setAdmins(admins)
      return admins[index]
    }
    return null
  }

  deleteAdmin(id) {
    const admins = this.getAdmins()
    const filteredAdmins = admins.filter(admin => admin.id !== id)
    this.setAdmins(filteredAdmins)
    return filteredAdmins.length < admins.length
  }

  // Complaint methods
  getComplaints() {
    this.ensureInitialized()
    return this.getFromStorage(STORAGE_KEYS.COMPLAINTS)
  }

  setComplaints(complaints) {
    return this.setToStorage(STORAGE_KEYS.COMPLAINTS, complaints)
  }

  async addComplaint(complaintData) {
    const complaints = this.getComplaints()
    const newComplaint = {
      ...complaintData,
      id: Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    complaints.push(newComplaint)
    this.setComplaints(complaints)
    
    // Send notification to user
    try {
      const user = this.getUserById(newComplaint.userId)
      if (user) {
        await sendComplaintNotification(user, newComplaint, 'complaintSubmitted')
      }
    } catch (error) {
      console.error('Failed to send complaint submission notification:', error)
    }
    
    return newComplaint
  }

  getComplaintById(id) {
    const complaints = this.getComplaints()
    return complaints.find(complaint => complaint.id === id)
  }

  getComplaintsByUserId(userId) {
    const complaints = this.getComplaints()
    return complaints.filter(complaint => complaint.userId === userId)
  }

  getComplaintsByDivision(division) {
    const complaints = this.getComplaints()
    return complaints.filter(complaint => complaint.division === division)
  }

  async updateComplaint(id, complaintData) {
    const complaints = this.getComplaints()
    const index = complaints.findIndex(complaint => complaint.id === id)
    if (index !== -1) {
      const oldComplaint = { ...complaints[index] }
      complaints[index] = {
        ...complaints[index],
        ...complaintData,
        updatedAt: new Date().toISOString()
      }
      this.setComplaints(complaints)
      
      // Send notification if status changed
      try {
        if (complaintData.status && complaintData.status !== oldComplaint.status) {
          const user = this.getUserById(complaints[index].userId)
          if (user) {
            const updatedComplaint = { ...complaints[index], previousStatus: oldComplaint.status }
            await sendComplaintNotification(user, updatedComplaint, 'statusUpdate')
          }
        }
      } catch (error) {
        console.error('Failed to send status update notification:', error)
      }
      
      return complaints[index]
    }
    return null
  }

  async updateComplaintStatus(id, status, adminNotes = '') {
    return await this.updateComplaint(id, { status, adminNotes })
  }

  deleteComplaint(id) {
    const complaints = this.getComplaints()
    const filteredComplaints = complaints.filter(complaint => complaint.id !== id)
    this.setComplaints(filteredComplaints)
    return filteredComplaints.length < complaints.length
  }

  // Search and filter methods
  searchComplaints(query, filters = {}) {
    let complaints = this.getComplaints()
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase()
      complaints = complaints.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        complaint.location.toLowerCase().includes(searchTerm) ||
        complaint.category.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
      complaints = complaints.filter(complaint => complaint.status === filters.status)
    }
    
    if (filters.severity && filters.severity !== 'all') {
      complaints = complaints.filter(complaint => complaint.severity === filters.severity)
    }
    
    if (filters.category && filters.category !== 'all') {
      complaints = complaints.filter(complaint => complaint.category === filters.category)
    }
    
    if (filters.userId) {
      complaints = complaints.filter(complaint => complaint.userId === filters.userId)
    }
    
    if (filters.division) {
      complaints = complaints.filter(complaint => complaint.division === filters.division)
    }
    
    if (filters.dateFrom) {
      complaints = complaints.filter(complaint => 
        new Date(complaint.createdAt) >= new Date(filters.dateFrom)
      )
    }
    
    if (filters.dateTo) {
      complaints = complaints.filter(complaint => 
        new Date(complaint.createdAt) <= new Date(filters.dateTo)
      )
    }
    
    return complaints
  }

  // Statistics methods
  getComplaintStats() {
    const complaints = this.getComplaints()
    
    return {
      total: complaints.length,
      byStatus: complaints.reduce((acc, complaint) => {
        acc[complaint.status] = (acc[complaint.status] || 0) + 1
        return acc
      }, {}),
      bySeverity: complaints.reduce((acc, complaint) => {
        acc[complaint.severity] = (acc[complaint.severity] || 0) + 1
        return acc
      }, {}),
      byCategory: complaints.reduce((acc, complaint) => {
        acc[complaint.category] = (acc[complaint.category] || 0) + 1
        return acc
      }, {}),
      byDivision: complaints.reduce((acc, complaint) => {
        acc[complaint.division] = (acc[complaint.division] || 0) + 1
        return acc
      }, {}),
      recent: complaints
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
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