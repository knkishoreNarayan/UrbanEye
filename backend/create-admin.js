import mongoose from 'mongoose'
import User from './models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbaneye')
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bbmp.gov.in' })
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const adminUser = new User({
      fullName: 'System Administrator',
      email: 'admin@bbmp.gov.in',
      phone: '+91-9876543210',
      address: 'BBMP Headquarters, Bangalore',
      password: 'admin123', // This will be hashed automatically
      role: 'admin',
      division: 'General'
    })

    await adminUser.save()
    console.log('Admin user created successfully:', adminUser.email)
    console.log('Password: admin123')
    console.log('Division: General')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createAdminUser()
