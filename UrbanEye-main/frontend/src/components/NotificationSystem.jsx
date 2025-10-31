import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Bell,
  Mail,
  MessageSquare,
  Send
} from 'lucide-react'
import apiService from '../services/apiService'

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([])
  const [notificationHistory, setNotificationHistory] = useState([])
  const [isProcessingNotifications, setIsProcessingNotifications] = useState(false)

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => 
          Date.now() - notification.timestamp < 5000
        )
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const addNotification = (type, title, message, options = {}) => {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: Date.now(),
      ...options
    }
    setNotifications(prev => [...prev, notification])
    
    // Add to history
    setNotificationHistory(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
  }

  // Send SMS/Email notification
  const sendExternalNotification = async (user, complaint, notificationType = 'complaintSubmitted') => {
    if (!user || isProcessingNotifications) return

    setIsProcessingNotifications(true)
    
    try {
      const result = await apiService.sendComplaintNotification(user, complaint, notificationType)
      
      let successCount = 0
      let failureCount = 0
      const messages = []

      if (result.sms) {
        if (result.sms.success) {
          successCount++
          messages.push('SMS sent successfully')
        } else {
          failureCount++
          messages.push(`SMS failed: ${result.sms.error}`)
        }
      }

      if (result.email) {
        if (result.email.success) {
          successCount++
          messages.push('Email sent successfully')
        } else {
          failureCount++
          messages.push(`Email failed: ${result.email.error}`)
        }
      }

      // Show notification result
      if (successCount > 0 && failureCount === 0) {
        addNotification('success', 'Notifications Sent', messages.join(', '), {
          icon: <Send className="h-5 w-5 text-green-600" />
        })
      } else if (successCount > 0 && failureCount > 0) {
        addNotification('warning', 'Partial Success', messages.join(', '), {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
        })
      } else {
        addNotification('error', 'Notification Failed', messages.join(', '), {
          icon: <XCircle className="h-5 w-5 text-red-600" />
        })
      }

      return result
    } catch (error) {
      console.error('External notification failed:', error)
      addNotification('error', 'Notification Error', 'Failed to send external notifications', {
        icon: <XCircle className="h-5 w-5 text-red-600" />
      })
      return { success: false, error: error.message }
    } finally {
      setIsProcessingNotifications(false)
    }
  }

  // Test notification function
  const testNotifications = async (user) => {
    const testComplaint = {
      id: 'TEST-' + Date.now(),
      title: 'Test Notification',
      category: 'System Test',
      priority: 'Medium',
      location: 'Test Location',
      status: 'Pending',
      createdAt: new Date().toISOString()
    }

    addNotification('info', 'Testing Notifications', 'Sending test SMS and Email...', {
      icon: <Send className="h-5 w-5 text-blue-600" />
    })

    await sendExternalNotification(user, testComplaint, 'complaintSubmitted')
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type, customIcon) => {
    if (customIcon) return customIcon
    
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info': return <Info className="h-5 w-5 text-blue-600" />
      case 'sms': return <MessageSquare className="h-5 w-5 text-green-600" />
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getBackgroundClass = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  // Expose notification functions globally
  useEffect(() => {
    window.showNotification = addNotification
    window.sendExternalNotification = sendExternalNotification
    window.testNotifications = testNotifications
    window.notificationHistory = notificationHistory
    
    return () => {
      delete window.showNotification
      delete window.sendExternalNotification
      delete window.testNotifications
      delete window.notificationHistory
    }
  }, [notificationHistory])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg animate-fade-in ${getBackgroundClass(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type, notification.icon)}
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="mt-1 text-sm text-gray-600">
                  {notification.message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper functions to show notifications
export const showSuccessNotification = (title, message, options = {}) => {
  if (window.showNotification) {
    window.showNotification('success', title, message, options)
  }
}

export const showErrorNotification = (title, message, options = {}) => {
  if (window.showNotification) {
    window.showNotification('error', title, message, options)
  }
}

export const showWarningNotification = (title, message, options = {}) => {
  if (window.showNotification) {
    window.showNotification('warning', title, message, options)
  }
}

export const showInfoNotification = (title, message, options = {}) => {
  if (window.showNotification) {
    window.showNotification('info', title, message, options)
  }
}

export const showSMSNotification = (title, message, options = {}) => {
  if (window.showNotification) {
    window.showNotification('sms', title, message, options)
  }
}

export const showEmailNotification = (title, message, options = {}) => {
  if (window.showNotification) {
    window.showNotification('email', title, message, options)
  }
}

// Send external notifications (SMS/Email)
export const sendComplaintNotification = async (user, complaint, type = 'complaintSubmitted') => {
  if (window.sendExternalNotification) {
    return await window.sendExternalNotification(user, complaint, type)
  }
  return { success: false, error: 'Notification system not available' }
}

// Test notifications
export const testExternalNotifications = async (user) => {
  if (window.testNotifications) {
    return await window.testNotifications(user)
  }
  return { success: false, error: 'Test function not available' }
}

// Get notification history
export const getNotificationHistory = () => {
  return window.notificationHistory || []
}

export default NotificationSystem