# GovIntel Frontend

A modern React application for AI-powered government grievance management system built with Vite.

## Features

- 🔐 **Role-based Authentication** (Citizen, Officer, Admin)
- 📱 **Responsive Design** with Tailwind CSS v4
- 🎯 **Redux State Management** with RTK
- 📁 **File Upload Support** (Images, Videos, Audio, Documents)
- 📊 **Interactive Dashboards** for all user types
- 🔍 **Advanced Filtering** and search capabilities
- 📈 **Real-time Analytics** and reporting
- 🎨 **Modern UI/UX** with smooth animations
- ⚡ **Vite** for lightning-fast development

## Tech Stack

- **React 19** - Frontend framework
- **Vite 6** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/devashishsoni98/govintel.git
   cd frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit `.env` with your configuration:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   VITE_UPLOAD_URL=http://localhost:5000
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests with Vitest

## Environment Variables

Since this is a Vite project, environment variables must be prefixed with `VITE_`:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_UPLOAD_URL` | File upload base URL | `http://localhost:5000` |
| `VITE_MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |
| `VITE_MAX_FILES_PER_GRIEVANCE` | Max files per grievance | `5` |

## Building for Production

1. **Create production build**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Preview the build**
   \`\`\`bash
   npm run preview
   \`\`\`

3. **Deploy the `dist` folder** to your hosting service

## Vite Benefits

- ⚡ **Lightning Fast HMR** - Instant hot module replacement
- 📦 **Optimized Builds** - Tree-shaking and code splitting
- 🔧 **Zero Config** - Works out of the box
- 🎯 **Modern ES Modules** - Native ESM support
- 🚀 **Fast Cold Start** - No bundling during development

## Development

### Proxy Configuration

The Vite dev server is configured to proxy API requests to the backend:

\`\`\`javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000',
    '/uploads': 'http://localhost:5000'
  }
}
\`\`\`

### Path Aliases

Use `@` to import from the src directory:

\`\`\`javascript
import Component from '@/components/Component'
import { store } from '@/store/store'
\`\`\`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
\`\`\`

```plaintext file=".env.example"
# API Configuration (Note: Vite requires VITE_ prefix)
VITE_API_URL=http://localhost:5000/api
VITE_UPLOAD_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=GovIntel
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=AI-powered government grievance management system

# Environment
VITE_ENV=development

# Features (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_MAX_FILE_SIZE=10485760
VITE_MAX_FILES_PER_GRIEVANCE=5

# External Services (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_SENTRY_DSN=your_sentry_dsn_here
