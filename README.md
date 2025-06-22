# 🩸 BloodLink - E-Blood Donation Management System

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/srinjay94764-gmailcoms-projects/v0-mern-stack-e-blood-link)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> **Hack4Bengal Project** - A modern, scalable blood donation platform connecting donors with those in need through an intelligent matching system and real-time communication features.

## 🌟 Overview

BloodLink is a comprehensive MERN stack application designed to bridge the gap between blood donors and recipients. Built for Hack4Bengal, it features an AI-powered chat assistant, real-time donor matching, inventory management, and a responsive modern UI/UX.

### 🎯 Key Features

- **🤖 AI Chat Assistant** - Intelligent blood donor search with natural language processing
- **🔍 Smart Donor Matching** - Advanced compatibility algorithm based on blood type compatibility
- **📱 Real-time Notifications** - Instant alerts for urgent blood requests
- **🏥 Hospital Integration** - Comprehensive hospital and inventory management
- **🔐 Secure Authentication** - JWT-based authentication with role-based access
- **📊 Analytics Dashboard** - Real-time statistics and request tracking
- **🌍 Location-based Search** - Find donors in specific cities across India
- **📞 Multi-channel Communication** - In-app chat, phone, and email integration

## 🏗️ Architecture

### System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React 19      │    │ • RESTful API   │    │ • User Data     │
│ • TypeScript    │    │ • JWT Auth      │    │ • Blood Data    │
│ • Tailwind CSS  │    │ • Mongoose ODM  │    │ • Requests      │
│ • Shadcn/ui     │    │ • CORS Config   │    │ • Inventory     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📁 Project Structure

```
BloodLink_Hack4Bengal/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 about/                    # About page
│   ├── 📂 api/                      # API routes (if any)
│   ├── 📂 dashboard/                # User dashboard
│   ├── 📂 donors/                   # Donor management
│   ├── 📂 inventory/                # Blood inventory
│   ├── 📂 login/                    # Authentication
│   ├── 📂 profile/                  # User profiles
│   ├── 📂 register/                 # User registration
│   ├── 📂 request/                  # Blood requests
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout
│   └── 📄 page.tsx                  # Home page
│
├── 📂 components/                   # Reusable UI Components
│   ├── 📄 blood-chat-assistant.tsx # AI Chat Assistant
│   ├── 📄 features.tsx             # Features section
│   ├── 📄 hero.tsx                 # Hero section
│   ├── 📄 stats.tsx                # Statistics
│   └── 📂 ui/                      # Shadcn/ui components
│
├── 📂 contexts/                     # React Context Providers
│   └── 📄 auth-context.tsx         # Authentication context
│
├── 📂 hooks/                        # Custom React Hooks
│   └── 📄 use-toast.tsx            # Toast notifications
│
├── 📂 lib/                          # Utility Libraries
│   ├── 📄 api.ts                   # API client
│   └── 📄 utils.ts                 # Helper functions
│
├── 📂 server/                       # Backend Express Server
│   ├── 📂 middleware/              # Express middleware
│   ├── 📂 models/                  # Mongoose schemas
│   │   ├── 📄 User.js              # User model
│   │   ├── 📄 BloodRequest.js      # Blood request model
│   │   └── 📄 Inventory.js         # Inventory model
│   ├── 📂 routes/                  # API routes
│   │   ├── 📄 auth.js              # Authentication routes
│   │   ├── 📄 donors.js            # Donor management
│   │   ├── 📄 requests.js          # Blood requests
│   │   ├── 📄 inventory.js         # Inventory management
│   │   ├── 📄 users.js             # User management
│   │   └── 📄 chat.js              # Chat functionality
│   ├── 📂 scripts/                 # Database scripts
│   └── 📄 server.js                # Express server entry
│
├── 📂 public/                       # Static assets
├── 📂 styles/                       # Additional styles
├── 📄 next.config.mjs              # Next.js configuration
├── 📄 tailwind.config.ts           # Tailwind CSS config
├── 📄 components.json              # Shadcn/ui config
└── 📄 package.json                 # Dependencies
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5.x
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4.17
- **Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API
### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, CORS
- **Validation**: express-validator
- **Email**: Nodemailer
- **File Upload**: Multer
- **Rate Limiting**: express-rate-limit
### Development Tools

- **Package Manager**: npm/pnpm
- **Linting**: ESLint
- **Testing**: Jest + Supertest
- **Development**: Nodemon
- **Build Tool**: Next.js built-in
- **Development**: Nodemon
- **Build Tool**: Next.js built-in
### AI-Powered Chat Assistant

- **Natural Language Processing**: Understands queries like "I need A+ blood in Kolkata"
- **Smart Parsing**: Extracts blood type and location from conversational text
- **Donor Matching**: Automatically finds compatible donors based on blood compatibility
- **Multi-city Support**: Covers 100+ Indian cities
### Blood Compatibility System

- **Donor Matching**: Automatically finds compatible donors based on blood compatibility
- **Multi-city Support**: Covers 100+ Indian cities

```javascript
// Advanced blood compatibility matrix
const bloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
}
```
### Request Management System

- **Urgency Levels**: Critical, Urgent, Moderate, Routine
- **Hospital Integration**: Complete hospital information management
- **Real-time Tracking**: Track request status and responses
- **Automated Matching**: Find compatible donors automatically
### User Management

- **Role-based Access**: Donors, Recipients, Hospitals, Admins
- **Profile Management**: Comprehensive user profiles
- **Availability Status**: Real-time donor availability
- **Verification System**: User verification and validation

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Shadcn/ui component library
- **Dark/Light Mode**: Theme switching capability
### Prerequisites

- Node.js 18.x or higher
- MongoDB 5.x or higher
- npm or pnpm package manager

### 1. Clone the Repository
```bash
git clone https://github.com/srinjaykarfa/BloodLink_Hack4Bengal.git
cd BloodLink_Hack4Bengal
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

### 3. Backend Setup
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
#### Frontend (.env.local)
# Start backend server
npm run dev
```

### 4. Environment Variables
#### Backend (server/.env)
#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (server/.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bloodlink
# or MongoDB Atlas URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodlink

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
### Donors

- `GET /api/donors` - Get all donors (with filters)
- `GET /api/donors/:id` - Get donor by ID
- `PUT /api/donors/:id/availability` - Update availability
### Blood Requests

- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request by ID
- `PUT /api/requests/:id` - Update request
- `POST /api/requests/:id/respond` - Respond to request
### Inventory

- `GET /api/inventory` - Get blood inventory
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory
### Health Check

- `GET /api/health` - Server health status
- `GET /api/requests/:id` - Get request by ID
- `PUT /api/requests/:id` - Update request
- `POST /api/requests/:id/respond` - Respond to request

### Inventory
- `GET /api/inventory` - Get blood inventory
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory

### Health Check
- `GET /api/health` - Server health status

## 🧪 Testing

```bash
# Frontend testing
npm run test

# Backend testing
cd server
npm run test

# Run all tests
npm run test:all
```

## 📱 Mobile Features

- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly**: Mobile-optimized touch interactions
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Real-time notifications for urgent requests
- **Location Services**: GPS-based donor search
## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured CORS for API security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation
- **XSS Protection**: Helmet.js for security headers

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Or using Vercel CLI
npm run build
### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Set up database user and network access
3. Update MONGODB_URI in environment variables
```bash
# Build and deploy
npm run build
npm start

# Environment variables must be set in deployment platform
```

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Set up database user and network access
3. Update MONGODB_URI in environment variables

## 📊 Performance Optimizations

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
  
### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Update documentation
- Follow ESLint rules

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
  
### Team ByteBusters

*Hack4Bengal 2025*

- **Srinjay Karfa** - Frontend Lead & Project Maintainer
  - Next.js development and UI/UX implementation
  - Component architecture and responsive design
  - Project coordination and deployment

- **Sayan Duary** - Backend Developer
  - Express.js API development
  - Authentication and security implementation
  - Server architecture and optimization

- **Jaydeep Sardar** - Backend Developer
  - Database design and MongoDB integration
  - API endpoint development
  - Data modeling and validation

- **Sunava Ghosh** - Real-Time Chat Integration & Database Specialist
  - Real-time messaging system implementation
  - Database optimization and indexing
  - Chat functionality and WebSocket integration


### Special Thanks
- **Hack4Bengal** - For providing the platform to build this solution
- **Vercel** - For seamless deployment
- **MongoDB** - For reliable database services
- **Open Source Community** - For amazing libraries and tools


## 🙏 Acknowledgments

- **Hack4Bengal** - For providing the platform to build this solution
- **Vercel** - For seamless deployment
- **MongoDB** - For reliable database services
- **Open Source Community** - For amazing libraries and tools

## 📞 Support

For support, email [srinjay94764@gmail.com](mailto:srinjay94764@gmail.com) or create an issue in the repository.

## 🔗 Links

- **Live Demo**: [E-Blood Link](https://v0-mern-stack-e-blood-link.vercel.app/)
- **Repository**: [Git Repo](https://github.com/srinjaykarfa/BloodLink_Hack4Bengal)

---

<div align="center">
  <p>Made with ❤️ for Hack4Bengal 2025</p>
  <p>🩸 <strong>BloodLink - Connecting Lives, Saving Lives</strong> 🩸</p>
</div>
