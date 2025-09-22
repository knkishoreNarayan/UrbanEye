import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Shield,
  Mail,
  MapPin,
  Key
} from 'lucide-react'

const AdminUserManagement = ({ admins = [], onAddAdmin, onUpdateAdmin, onDeleteAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    division: '',
    accessCode: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const divisions = [
    'Koramangala', 'BTM Layout', 'HSR Layout', 'Indiranagar',
    'Whitefield', 'Marathahalli', 'Jayanagar', 'Bannerghatta',
    'Electronic City', 'Hebbal', 'Yelahanka', 'Malleshwaram'
  ]

  const filteredAdmins = admins.filter(admin =>
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.division.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.division) {
      newErrors.division = 'Division is required'
    }
    
    if (!formData.accessCode.trim()) {
      newErrors.accessCode = 'Access code is required'
    }
    
    if (!editingAdmin && !formData.password.trim()) {
      newErrors.password = 'Password is required'
    }
    
    // Check for duplicate email
    const existingAdmin = admins.find(admin => 
      admin.email === formData.email && admin.id !== editingAdmin?.id
    )
    if (existingAdmin) {
      newErrors.email = 'Email already exists'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const adminData = {
      ...formData,
      id: editingAdmin ? editingAdmin.id : Date.now()
    }
    
    if (editingAdmin) {
      onUpdateAdmin(adminData)
      if (window.showNotification) {
        window.showNotification('success', 'Admin Updated', 'Admin user has been updated successfully')
      }
    } else {
      onAddAdmin(adminData)
      if (window.showNotification) {
        window.showNotification('success', 'Admin Added', 'New admin user has been created successfully')
      }
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      division: '',
      accessCode: '',
      password: ''
    })
    setErrors({})
    setShowAddForm(false)
    setEditingAdmin(null)
  }

  const handleEdit = (admin) => {
    setEditingAdmin(admin)
    setFormData({
      email: admin.email,
      fullName: admin.fullName,
      division: admin.division,
      accessCode: admin.accessCode,
      password: ''
    })
    setShowAddForm(true)
  }

  const handleDelete = (admin) => {
    if (window.confirm(`Are you sure you want to delete admin "${admin.fullName}"?`)) {
      onDeleteAdmin(admin.id)
      if (window.showNotification) {
        window.showNotification('success', 'Admin Deleted', 'Admin user has been removed successfully')
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-civic-dark flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Admin User Management
              </CardTitle>
              <CardDescription>
                Manage admin users and their access permissions
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-civic-accent hover:bg-civic-accent/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
            <Input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="border-civic-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingAdmin ? 'Edit Admin User' : 'Add New Admin User'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-civic-dark mb-1">
                        Full Name
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={errors.fullName ? 'border-red-500' : ''}
                        placeholder="Enter full name"
                      />
                      {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-civic-dark mb-1">
                        Email Address
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'border-red-500' : ''}
                        placeholder="Enter email address"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-civic-dark mb-1">
                        Division
                      </label>
                      <Select 
                        value={formData.division}
                        onValueChange={(value) => handleSelectChange('division', value)}
                      >
                        <SelectTrigger className={errors.division ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division} value={division}>
                              {division}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.division && <p className="mt-1 text-sm text-red-600">{errors.division}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-civic-dark mb-1">
                        Access Code
                      </label>
                      <Input
                        name="accessCode"
                        value={formData.accessCode}
                        onChange={handleInputChange}
                        className={errors.accessCode ? 'border-red-500' : ''}
                        placeholder="Enter access code"
                      />
                      {errors.accessCode && <p className="mt-1 text-sm text-red-600">{errors.accessCode}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-civic-dark mb-1">
                        Password {editingAdmin && '(leave blank to keep current)'}
                      </label>
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'border-red-500' : ''}
                        placeholder={editingAdmin ? "Enter new password (optional)" : "Enter password"}
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="bg-civic-accent hover:bg-civic-accent/90 text-white">
                      {editingAdmin ? 'Update Admin' : 'Add Admin'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Admin List */}
          <div className="space-y-3">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-civic-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-civic-dark mb-2">No Admin Users Found</h3>
                <p className="text-civic-text">
                  {searchTerm ? 'No admins match your search criteria.' : 'No admin users have been created yet.'}
                </p>
              </div>
            ) : (
              filteredAdmins.map((admin) => (
                <Card key={admin.id} className="border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-civic-accent/10 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-civic-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-civic-dark">{admin.fullName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-civic-text mt-1">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {admin.email}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {admin.division}
                            </div>
                            <div className="flex items-center">
                              <Key className="h-3 w-3 mr-1" />
                              {admin.accessCode}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(admin)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminUserManagement