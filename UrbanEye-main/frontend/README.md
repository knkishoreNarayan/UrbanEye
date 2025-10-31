# Urban Eye - Civic Issue Management System

A comprehensive web application for reporting and managing civic issues in urban areas. Built with React, Node.js, and MongoDB.

## 🌟 Features

### For Citizens
- **Report Issues**: Submit civic complaints with photos, location, and detailed descriptions
- **Photo Capture**: Integrated camera functionality for evidence collection
- **Real-time Tracking**: Monitor the status of your submitted complaints
- **Interactive Map**: View issues on an interactive map
- **User Dashboard**: Track all your submitted complaints

### For Administrators
- **Issue Management**: View and manage complaints by division
- **Status Updates**: Update complaint status (Pending, In Progress, Resolved)
- **Photo Viewing**: View attached photos for better issue assessment
- **Division-based Access**: Admins can only see complaints from their assigned division
- **Analytics Dashboard**: Overview of complaint statistics

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Multer** for file uploads
- **JWT** for authentication
- **CORS** for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd urbanryr1
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**
   - Create `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/urbaneye
   JWT_SECRET=your_jwt_secret_here
   PORT=4000
   ```

5. **Start the development servers**
   
   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm start
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 🗄️ Database Setup

The application uses MongoDB with the following collections:

### Users Collection
- User registration and authentication
- Profile information

### Admins Collection
- Admin user management
- Division-based access control

### Complaints Collection
- Civic issue reports
- Photo attachments (stored as base64)
- Status tracking and updates

## 🔐 Authentication

### User Authentication
- Email/password registration and login
- JWT token-based authentication
- Session management with localStorage

### Admin Authentication
- Admin-specific login system
- Division-based access control
- Secure admin dashboard

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login

### Complaints
- `GET /api/complaints` - Get complaints (with filters)
- `POST /api/complaints` - Create new complaint
- `PATCH /api/complaints/:id/status` - Update complaint status
- `GET /api/complaints/stats/overview` - Get complaint statistics

## 🎨 UI Components

### Reusable Components
- **Button** - Custom button component
- **Card** - Card layout component
- **Input** - Form input component
- **Select** - Dropdown select component
- **Textarea** - Multi-line text input

### Page Components
- **LandingPage** - Homepage with feature overview
- **UserDashboard** - User complaint management
- **AdminDashboard** - Admin issue management
- **ComplaintDetailModal** - Detailed complaint view

## 📸 Photo Management

- **Camera Integration**: Direct camera access for photo capture
- **Photo Validation**: Mandatory photo requirement for complaints
- **Base64 Storage**: Photos stored as base64 strings in MongoDB
- **Photo Preview**: Real-time photo preview and confirmation

## 🗺️ Location Features

- **Location Input**: Manual location entry
- **Division Mapping**: Automatic division assignment based on location
- **Map Integration**: Interactive map view for complaints

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set environment variables for API URL

### Backend Deployment (Railway/Heroku)
1. Set up MongoDB Atlas or use cloud MongoDB
2. Configure environment variables
3. Deploy the `server` folder
4. Update frontend API URL to point to deployed backend

## 🔧 Configuration

### Environment Variables
```env
# Backend (.env in server directory)
MONGODB_URI=mongodb://localhost:27017/urbaneye
JWT_SECRET=your_jwt_secret_here
PORT=4000

# Frontend (.env in root directory)
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📊 Features Overview

### User Features
- ✅ User registration and login
- ✅ Complaint submission with photo
- ✅ Real-time complaint tracking
- ✅ Interactive dashboard
- ✅ Photo capture and validation

### Admin Features
- ✅ Admin authentication
- ✅ Division-based complaint management
- ✅ Status update functionality
- ✅ Photo viewing capabilities
- ✅ Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔮 Future Enhancements

- [ ] Mobile app development
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Advanced photo editing
- [ ] GPS location tracking
- [ ] Voice note attachments

---

**Urban Eye** - Making cities better, one complaint at a time! 🏙️✨
