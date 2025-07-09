# KidsTube Frontend

A modern React-based frontend for the KidsTube video-sharing platform, designed for parents to manage child-appropriate content.

## Features

- **Modern UI/UX**: Built with Material-UI for a beautiful, responsive design
- **Authentication**: Secure login/register with JWT token management
- **Child Profile Management**: Create and manage multiple child profiles
- **Video Browsing**: Search and filter age-appropriate videos
- **Video Upload**: Easy video upload with metadata management
- **Parent Approval System**: Request and approve videos for children
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **React 19** with functional components and hooks
- **Material-UI (MUI)** for UI components and theming
- **React Router** for navigation and routing
- **Axios** for API communication
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── api/                 # API service layer
│   ├── config.js       # Axios configuration
│   ├── auth.js         # Authentication API
│   ├── children.js     # Child profiles API
│   └── videos.js       # Videos API
├── components/         # Reusable components
│   ├── Navigation.js   # Main navigation bar
│   └── ProtectedRoute.js # Route protection
├── contexts/          # React contexts
│   └── AuthContext.js # Authentication context
├── pages/             # Page components
│   ├── Login.js       # Login page
│   ├── Register.js    # Registration page
│   ├── Home.js        # Home dashboard
│   ├── Videos.js      # Video browsing
│   ├── Upload.js      # Video upload
│   ├── Children.js    # Child management
│   └── Profile.js     # User profile
└── App.js             # Main app component
```

## Key Features

### Authentication
- Secure login and registration
- JWT token management
- Protected routes
- Automatic token refresh

### Child Profile Management
- Create multiple child profiles
- Set age, gender, and preferences
- Track requested and approved videos
- Manage video approval workflow

### Video Management
- Browse age-appropriate videos
- Search and filter by category, age range
- Upload videos with metadata
- View upload progress and status

### User Experience
- Responsive design for all devices
- Intuitive navigation
- Real-time feedback and error handling
- Loading states and progress indicators

## API Integration

The frontend communicates with the backend through a well-structured API layer:

- **Authentication**: Login, register, profile management
- **Child Profiles**: CRUD operations for child accounts
- **Videos**: Upload, browse, manage videos
- **User Management**: Profile updates, password changes

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Development

### Adding New Features
1. Create new components in `components/` or `pages/`
2. Add API methods in the appropriate `api/` file
3. Update routing in `App.js` if needed
4. Test thoroughly across different screen sizes

### Styling
- Use Material-UI components and theming
- Follow the established design system
- Ensure responsive design for mobile devices

### State Management
- Use React Context for global state (auth, user data)
- Use local state for component-specific data
- Keep state as close to where it's used as possible

## Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Serve the build folder:**
   ```bash
   npx serve -s build
   ```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Test your changes thoroughly
3. Ensure responsive design works on all screen sizes
4. Update documentation as needed

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure the backend server is running
   - Check the `REACT_APP_API_URL` environment variable
   - Verify CORS settings on the backend

2. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for version conflicts in package.json

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

## License

This project is part of the KidsTube platform.
