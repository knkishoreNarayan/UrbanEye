import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AdminLogin from '../models/AdminLogin.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, address, password, role = 'user', division = null } = req.body
    
    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }

    // Validate admin email domain
    if (role === 'admin' && !email.endsWith('@bbmp.gov.in')) {
      return res.status(400).json({ error: 'Admin emails must be from @bbmp.gov.in domain' })
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      phone,
      address,
      password,
      role,
      division: role === 'admin' ? division : null
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user._id, 
        role: user.role, 
        division: user.division 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    )

    res.status(201).json({ 
      user: user.toJSON(), 
      token 
    })
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: errors.join(', ') })
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    
    res.status(500).json({ error: 'Signup failed' })
  }
})

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(401).json({ error: 'Invalid role' })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update login info
    await user.updateLoginInfo()

    // Log admin login
    if (user.role === 'admin') {
      const adminLogin = new AdminLogin({
        email: user.email,
        division: user.division,
        adminId: user._id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      })
      await adminLogin.save()
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user._id, 
        role: user.role, 
        division: user.division 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    )

    res.json({ 
      user: user.toJSON(), 
      token 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.sub)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: user.toJSON() })
  } catch (error) {
    console.error('Profile error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const { fullName, phone, address } = req.body
    
    const user = await User.findById(decoded.sub)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName
    if (phone) user.phone = phone
    if (address) user.address = address

    await user.save()

    res.json({ user: user.toJSON() })
  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: errors.join(', ') })
    }
    
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    const user = await User.findById(decoded.sub)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// Logout (for admin login tracking)
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    
    // End active admin session
    if (decoded.role === 'admin') {
      await AdminLogin.findOneAndUpdate(
        { adminId: decoded.sub, isActive: true },
        { $set: { isActive: false, logoutTime: new Date() } }
      )
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Admin Signup (Legacy endpoint)
router.post('/admin/signup', async (req, res) => {
  try {
    const { full_name, email, password, division } = req.body;
    
    // Convert to the format expected by the main signup
    req.body = {
      fullName: full_name,
      email,
      password,
      role: 'admin',
      division
    };

    // Call the main signup function
    const signupHandler = router.stack.find(layer => 
      layer.route?.path === '/signup' && layer.route?.methods?.post
    )?.route?.stack[0]?.handle;

    if (signupHandler) {
      await signupHandler(req, res);
    } else {
      res.status(500).json({ error: 'Admin signup not available' });
    }
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ error: 'Admin signup failed' });
  }
});

// Admin Login (Legacy endpoint)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password, division } = req.body;
    
    // Convert to the format expected by the main login
    req.body = {
      email,
      password,
      role: 'admin'
    };

    // Call the main login function
    const loginHandler = router.stack.find(layer => 
      layer.route?.path === '/login' && layer.route?.methods?.post
    )?.route?.stack[0]?.handle;

    if (loginHandler) {
      await loginHandler(req, res);
    } else {
      res.status(500).json({ error: 'Admin login not available' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

export default router



