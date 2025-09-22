import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.')
  process.exit(1) // Stop the app
}

let isConnected = false

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected')
    return
  }

  try {
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Try operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false, // Disable mongoose buffering
    }

    await mongoose.connect(MONGODB_URI, options)

    isConnected = true
    console.log('✅ MongoDB connected successfully')

    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected')
      isConnected = false
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
      isConnected = true
    })
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    isConnected = false
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect()
    isConnected = false
    console.log('MongoDB disconnected')
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDB()
  process.exit(0)
})

export { mongoose }
