# Hygeia-Nexus Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or Atlas cloud)
- npm or yarn package manager

## Quick Setup (Windows)

### Option 1: Automated Setup
1. Double-click `setup-and-run.bat`
2. Wait for installation to complete
3. Both servers will start automatically

### Option 2: Manual Setup
1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

## Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Demo Login Credentials
- **Admin**: admin@example.com / password123
- **Doctor**: doctor@example.com / password123
- **Patient**: patient@example.com / password123

## Project Structure
```
hygeia-nexus/
├── Backend/          # Node.js + Express API
├── Frontend/         # React + Vite Application
├── package.json      # Root package configuration
└── setup-and-run.bat # Windows setup script
```

## Environment Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hygeia-nexus
JWT_SECRET=your_jwt_secret_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Available Scripts

### Root Level
- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only backend
- `npm run client` - Start only frontend

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Common Issues
1. **Port already in use**: Change ports in environment files
2. **MongoDB connection error**: Ensure MongoDB is running
3. **Module not found**: Run `npm run install-all` again

### Database Setup
1. **Local MongoDB**: Start MongoDB service
2. **MongoDB Atlas**: Update MONGODB_URI with your connection string

## Next Steps
1. Configure your MongoDB connection
2. Set up Gemini API key for AI features
3. Customize the application for your hospital needs
4. Deploy to production when ready

## Support
- Check the main README.md for detailed documentation
- Review the API endpoints in the backend routes
- Examine component structure in the frontend src folder