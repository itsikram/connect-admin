# Environment Variables Configuration

This document describes all the environment variables used in the Admin Portal application.

## Required Environment Variables

### API Configuration
- `NEXT_PUBLIC_API_URL` - The base URL for the backend API (default: `http://localhost:3000`)

## Optional Environment Variables

### App Configuration
- `NEXT_PUBLIC_APP_NAME` - Application name (default: `Admin Portal`)
- `NEXT_PUBLIC_APP_VERSION` - Application version (default: `1.0.0`)
- `NEXT_PUBLIC_APP_DESCRIPTION` - Application description (default: `Professional admin dashboard for managing your platform`)
- `NEXT_PUBLIC_APP_AUTHOR` - Application author (default: `Admin Team`)

### API Settings
- `NEXT_PUBLIC_API_TIMEOUT` - API request timeout in milliseconds (default: `10000`)
- `NEXT_PUBLIC_API_RETRY_ATTEMPTS` - Number of retry attempts for failed requests (default: `3`)

### Feature Flags
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics features (default: `false`)
- `NEXT_PUBLIC_ENABLE_DEBUG` - Enable debug mode (default: `true` in development)
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` - Enable notifications (default: `true`)
- `NEXT_PUBLIC_ENABLE_DARK_MODE` - Enable dark mode (default: `true`)

## Environment Files

### Development
Create a `.env.local` file in the root directory for local development:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=Admin Portal
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Production
For production deployment, set these environment variables in your hosting platform:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# App Configuration
NEXT_PUBLIC_APP_NAME=Admin Portal
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Usage in Code

Environment variables are accessed through the configuration system:

```javascript
import { API_CONFIG, APP_CONFIG, FEATURE_FLAGS } from '../lib/config';

// Use API configuration
const apiUrl = API_CONFIG.BASE_URL;

// Use app configuration
const appName = APP_CONFIG.NAME;

// Use feature flags
if (FEATURE_FLAGS.ENABLE_DEBUG) {
  console.log('Debug mode enabled');
}
```

## Security Notes

- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client-side code
- Never put sensitive information like API keys or secrets in `NEXT_PUBLIC_` variables
- Use server-side environment variables for sensitive data
- Always validate environment variables before using them in production

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure the `.env.local` file is in the root directory
   - Restart the development server after adding new variables
   - Check that variable names are prefixed with `NEXT_PUBLIC_`

2. **API requests failing**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check that the backend server is running
   - Ensure CORS is properly configured on the backend

3. **Feature flags not working**
   - Check that the environment variable is set to `'true'` (string)
   - Verify the variable name matches exactly
   - Restart the development server

### Debug Mode

Enable debug mode to see environment variable values:

```bash
NEXT_PUBLIC_ENABLE_DEBUG=true
```

This will log configuration values to the console in development mode.
