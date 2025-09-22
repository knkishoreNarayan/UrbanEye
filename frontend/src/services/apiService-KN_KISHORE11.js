// API Service for external integrations
// Handles SMS, Email, and Maps API calls

class APIService {
  constructor() {
    this.config = {
      backend: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
      },
      googleMaps: {
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      },
      twilio: {
        accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
        phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
      },
      sendGrid: {
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY,
        fromEmail: import.meta.env.VITE_SENDGRID_FROM_EMAIL,
      },
      mailgun: {
        apiKey: import.meta.env.VITE_MAILGUN_API_KEY,
        domain: import.meta.env.VITE_MAILGUN_DOMAIN,
      },
      app: {
        name: import.meta.env.VITE_APP_NAME || 'Urban Eye',
        url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
      }
    }
  }
  // Backend calls
  async signup(user) {
    const res = await fetch(`${this.config.backend.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Signup failed')
    }
    return await res.json()
  }

  async login(credentials) {
    console.log('APIService: Attempting login with:', { ...credentials, password: '[HIDDEN]' })
    const res = await fetch(`${this.config.backend.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    console.log('APIService: Login response status:', res.status)
    if (!res.ok) {
      const error = await res.json()
      console.error('APIService: Login error:', error)
      throw new Error(error.error || 'Login failed')
    }
    const data = await res.json()
    console.log('APIService: Login successful, data:', data)
    return data
  }

  async createComplaint(data, file) {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => form.append(k, v))
    if (file) form.append('photo', file)
    
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/complaints`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Create complaint failed')
    }
    return await res.json()
  }

  async listComplaints(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString()
      const token = localStorage.getItem('urbanEyeToken')
      console.log('Fetching complaints with params:', params, 'Token:', token ? 'Present' : 'Missing')
      
      const res = await fetch(`${this.config.backend.baseUrl}/api/complaints${qs ? `?${qs}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('API response status:', res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error('API error:', error)
        throw new Error(error.error || 'Fetch complaints failed')
      }
      
      const data = await res.json()
      console.log('API response data:', data)
      return data
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  async getComplaintById(id) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/complaints/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Fetch complaint failed')
    }
    return await res.json()
  }

  async updateComplaint(id, data) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Update complaint failed')
    }
    return await res.json()
  }

  async updateComplaintStatus(id, payload) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Update status failed')
    }
    return await res.json()
  }

  async deleteComplaint(id) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/complaints/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Delete complaint failed')
    }
    return await res.json()
  }

  async getComplaintStats(filters = {}) {
    const qs = new URLSearchParams(filters).toString()
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/complaints/stats/overview${qs ? `?${qs}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Fetch stats failed')
    }
    return await res.json()
  }

  // User management methods
  async getUsers() {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Fetch users failed')
    }
    return await res.json()
  }

  async getAdmins() {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/users?role=admin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Fetch admins failed')
    }
    return await res.json()
  }

  async getUserById(id) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Fetch user failed')
    }
    return await res.json()
  }

  async getUserByEmail(email) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/users/email/${email}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Fetch user failed')
    }
    return await res.json()
  }

  async updateUser(id, data) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Update user failed')
    }
    return await res.json()
  }

  async deleteUser(id) {
    const token = localStorage.getItem('urbanEyeToken')
    const res = await fetch(`${this.config.backend.baseUrl}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Delete user failed')
    }
    return await res.json()
  }


  // SMS Service using Twilio
  async sendSMS(phoneNumber, message) {
    try {
      // In a real implementation, this would be handled by a backend service
      // Frontend cannot directly call Twilio due to CORS and security concerns
      console.log('SMS Service - Sending SMS:', { phoneNumber, message })
      
      // Simulate API call for demo purposes
      const response = await this.simulateAPICall({
        service: 'twilio',
        action: 'send_sms',
        data: {
          to: phoneNumber,
          from: this.config.twilio.phoneNumber,
          body: message
        }
      })

      return {
        success: true,
        messageId: response.messageId,
        status: 'sent'
      }
    } catch (error) {
      console.error('SMS sending failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Email Service using SendGrid
  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      console.log('Email Service - Sending Email:', { to, subject })
      
      // Simulate API call for demo purposes
      const response = await this.simulateAPICall({
        service: 'sendgrid',
        action: 'send_email',
        data: {
          to: to,
          from: this.config.sendGrid.fromEmail,
          subject: subject,
          html: htmlContent,
          text: textContent
        }
      })

      return {
        success: true,
        messageId: response.messageId,
        status: 'sent'
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Google Maps Geocoding Service
  async geocodeAddress(address) {
    try {
      if (!this.config.googleMaps.apiKey || this.config.googleMaps.apiKey.includes('your_')) {
        // Fallback to mock data if no real API key
        return this.mockGeocodeResponse(address)
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.config.googleMaps.apiKey}`
      )

      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0]
        return {
          success: true,
          data: {
            address: result.formatted_address,
            location: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            placeId: result.place_id,
            components: result.address_components
          }
        }
      } else {
        throw new Error(data.error_message || 'Geocoding failed')
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Reverse Geocoding - Get address from coordinates
  async reverseGeocode(lat, lng) {
    try {
      if (!this.config.googleMaps.apiKey || this.config.googleMaps.apiKey.includes('your_')) {
        // Fallback to mock data if no real API key
        return this.mockReverseGeocodeResponse(lat, lng)
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.config.googleMaps.apiKey}`
      )

      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0]
        return {
          success: true,
          data: {
            address: result.formatted_address,
            location: { lat, lng },
            placeId: result.place_id,
            components: result.address_components
          }
        }
      } else {
        throw new Error(data.error_message || 'Reverse geocoding failed')
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get nearby places (hospitals, police stations, etc.)
  async getNearbyPlaces(lat, lng, type = 'hospital', radius = 5000) {
    try {
      if (!this.config.googleMaps.apiKey || this.config.googleMaps.apiKey.includes('your_')) {
        // Fallback to mock data if no real API key
        return this.mockNearbyPlacesResponse(lat, lng, type)
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.config.googleMaps.apiKey}`
      )

      const data = await response.json()

      if (data.status === 'OK') {
        return {
          success: true,
          data: data.results.map(place => ({
            name: place.name,
            address: place.vicinity,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            placeId: place.place_id,
            rating: place.rating,
            types: place.types,
            openNow: place.opening_hours?.open_now
          }))
        }
      } else {
        throw new Error(data.error_message || 'Places search failed')
      }
    } catch (error) {
      console.error('Places search failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Notification Templates
  getNotificationTemplates() {
    return {
      complaintSubmitted: {
        sms: (complaintId, category) => 
          `Your complaint #${complaintId} for ${category} has been submitted successfully. Track status at ${this.config.app.url}/dashboard`,
        email: {
          subject: (complaintId) => `Complaint #${complaintId} Submitted - Urban Eye`,
          html: (complaint) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Complaint Submitted Successfully</h2>
              <p>Dear Citizen,</p>
              <p>Your complaint has been successfully submitted to Urban Eye. Here are the details:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Complaint ID:</strong> #${complaint.id}</p>
                <p><strong>Category:</strong> ${complaint.category}</p>
                <p><strong>Priority:</strong> ${complaint.priority}</p>
                <p><strong>Location:</strong> ${complaint.location}</p>
                <p><strong>Status:</strong> ${complaint.status}</p>
                <p><strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
              <p>You can track your complaint status at: <a href="${this.config.app.url}/dashboard">${this.config.app.url}/dashboard</a></p>
              <p>Thank you for helping make our city better!</p>
              <p>Best regards,<br>Urban Eye Team</p>
            </div>
          `
        }
      },
      statusUpdate: {
        sms: (complaintId, status) => 
          `Update: Your complaint #${complaintId} status changed to ${status}. Check details at ${this.config.app.url}/dashboard`,
        email: {
          subject: (complaintId, status) => `Complaint #${complaintId} Status Update - ${status}`,
          html: (complaint, oldStatus) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Complaint Status Update</h2>
              <p>Dear Citizen,</p>
              <p>Your complaint status has been updated:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Complaint ID:</strong> #${complaint.id}</p>
                <p><strong>Category:</strong> ${complaint.category}</p>
                <p><strong>Previous Status:</strong> ${oldStatus}</p>
                <p><strong>Current Status:</strong> <span style="color: #059669; font-weight: bold;">${complaint.status}</span></p>
                <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
              </div>
              ${complaint.adminNotes ? `<p><strong>Admin Notes:</strong> ${complaint.adminNotes}</p>` : ''}
              <p>View full details at: <a href="${this.config.app.url}/dashboard">${this.config.app.url}/dashboard</a></p>
              <p>Thank you for your patience!</p>
              <p>Best regards,<br>Urban Eye Team</p>
            </div>
          `
        }
      }
    }
  }

  // Send complaint notification
  async sendComplaintNotification(user, complaint, type = 'complaintSubmitted') {
    const templates = this.getNotificationTemplates()
    const template = templates[type]

    if (!template) {
      throw new Error(`Unknown notification type: ${type}`)
    }

    const results = {
      sms: null,
      email: null
    }

    // Send SMS if user has phone number
    if (user.phone) {
      try {
        const smsMessage = template.sms(complaint.id, complaint.category)
        results.sms = await this.sendSMS(user.phone, smsMessage)
      } catch (error) {
        console.error('SMS notification failed:', error)
        results.sms = { success: false, error: error.message }
      }
    }

    // Send Email
    if (user.email) {
      try {
        const emailSubject = template.email.subject(complaint.id, complaint.status)
        const emailHtml = template.email.html(complaint, complaint.previousStatus)
        results.email = await this.sendEmail(user.email, emailSubject, emailHtml)
      } catch (error) {
        console.error('Email notification failed:', error)
        results.email = { success: false, error: error.message }
      }
    }

    return results
  }

  // Mock/Simulation methods for demo purposes
  async simulateAPICall(request) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simulate success/failure
    if (Math.random() > 0.1) { // 90% success rate
      return {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent',
        timestamp: new Date().toISOString()
      }
    } else {
      throw new Error('Simulated API failure')
    }
  }

  mockGeocodeResponse(address) {
    // Mock geocoding response for demo
    const mockLocations = {
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'default': { lat: 12.9716, lng: 77.5946 }
    }

    const key = Object.keys(mockLocations).find(k => 
      address.toLowerCase().includes(k)
    ) || 'default'

    return {
      success: true,
      data: {
        address: `${address}, India`,
        location: mockLocations[key],
        placeId: `mock_place_${Date.now()}`,
        components: []
      }
    }
  }

  mockReverseGeocodeResponse(lat, lng) {
    return {
      success: true,
      data: {
        address: `Mock Address near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        location: { lat, lng },
        placeId: `mock_place_${Date.now()}`,
        components: []
      }
    }
  }

  mockNearbyPlacesResponse(lat, lng, type) {
    const mockPlaces = {
      hospital: [
        { name: 'City General Hospital', vicinity: 'Main Road', rating: 4.2 },
        { name: 'Emergency Medical Center', vicinity: 'Health Street', rating: 4.0 }
      ],
      police: [
        { name: 'Local Police Station', vicinity: 'Government Area', rating: 3.8 },
        { name: 'Traffic Police Post', vicinity: 'Junction Road', rating: 3.5 }
      ]
    }

    return {
      success: true,
      data: (mockPlaces[type] || mockPlaces.hospital).map((place, index) => ({
        ...place,
        location: {
          lat: lat + (Math.random() - 0.5) * 0.01,
          lng: lng + (Math.random() - 0.5) * 0.01
        },
        placeId: `mock_${type}_${index}`,
        types: [type],
        openNow: Math.random() > 0.3
      }))
    }
  }
}

// Export singleton instance
export default new APIService()