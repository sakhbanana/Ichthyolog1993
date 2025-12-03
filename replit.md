# Firebase Studio - Next.js Chat Application

## Overview
This is a Next.js application with Firebase authentication and real-time chat functionality. The app is designed for a group chat for "Ихтиологи 1993" (Ichthyologists class of 1993).

## Project Structure
- **Frontend**: Next.js 15.3.3 with React 18, using App Router
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore for user data and chat messages
- **AI Integration**: Google Genkit for AI features
- **UI**: Tailwind CSS with Radix UI components
- **PWA**: Progressive Web App support via next-pwa

## Key Technologies
- Next.js 15.3.3 with Turbopack
- Firebase (Auth + Firestore)
- Google Genkit AI
- Radix UI components
- Tailwind CSS
- TypeScript

## Development Setup

### Running the Application
The app runs on port 5000 and binds to 0.0.0.0 for Replit compatibility.

```bash
npm run dev
```

### Building for Production
The app exports as a static site for production:

```bash
npm run build
```

This creates an `out` directory with static files ready for deployment.

## Configuration

### Next.js Configuration
- **Development**: Standard Next.js server with hot reload
- **Production**: Static export mode (`output: "export"`)
- **Images**: Unoptimized for static export compatibility
- **Cross-origin**: Configured for Replit proxy compatibility

### Firebase Configuration
Firebase config is located in `src/firebase/config.ts` with hardcoded values for the Firebase Studio project.

## Project Status
- ✅ Development server configured and running on port 5000
- ✅ Firebase authentication integrated
- ✅ Real-time chat functionality
- ✅ PWA support enabled
- ✅ Responsive design with mobile support
- ✅ Deployment configured for static hosting

## Recent Changes
- **2025-12-03**: Migrated from GitHub to Replit
  - Updated dev server to run on port 5000 with 0.0.0.0 binding
  - Configured Next.js for Replit proxy compatibility
  - Set up workflow for automatic dependency installation
  - Configured deployment for static export
  - Removed static export mode from development (kept for production only)

## User Preferences
- Application is in Russian language
- Uses Firebase for all backend services
- Designed as a Progressive Web App
