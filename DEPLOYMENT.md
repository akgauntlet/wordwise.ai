# Deployment Guide

## Environment Configuration Fix

This document explains how to properly configure environments to avoid the issue where local development hits production endpoints and vice versa.

## The Problem (Solved)

Previously, the application had inverted environment configuration:
- Local development was hitting production Firebase Functions
- Production deployment was hitting local emulator endpoints

## The Solution

We've implemented smart environment detection that automatically chooses the correct Firebase Functions endpoint based on the current environment.

### How It Works

The `getFunctionsUrl()` function in `src/lib/firebase/config.ts` automatically detects:

1. **Local Development** (`localhost` or `127.0.0.1`):
   - Uses the `VITE_FIREBASE_FUNCTIONS_URL` from environment files
   - Defaults to `http://localhost:5001/PROJECT_ID/us-central1`

2. **Firebase Hosting** (production with `*.web.app` or `*.firebaseapp.com`):
   - Uses relative URLs (`/api`) that leverage Firebase Hosting rewrites
   - Firebase automatically routes these to the correct functions

3. **Other Production Environments**:
   - Falls back to the full production URL: `https://us-central1-PROJECT_ID.cloudfunctions.net`

## Development Commands

```bash
# Local development (uses emulator)
npm run dev

# Build for development (includes source maps, uses emulator URLs)
npm run build:dev

# Build for production (optimized, uses production URLs)
npm run build
```

## Environment Files

### `.env.development` (Local Development)
- Used during `npm run dev`
- Contains local emulator URLs
- Safe to commit to version control

### `.env.local` (Developer Overrides)
- Used for personal development overrides
- Takes precedence over `.env.development`
- Currently configured for local development
- Safe to commit for team sharing

### Production Environment Variables
- Set directly in Firebase Hosting environment or CI/CD pipeline
- No `.env.production` file needed in the repository
- Environment variables are embedded during build time

## Firebase Hosting Rewrites

The `firebase.json` file contains URL rewrites that make Firebase Functions available at `/api` paths:

```json
{
  "rewrites": [
    {
      "source": "/api/parseDocument/**",
      "function": "parseDocument",
      "region": "us-central1"
    },
    {
      "source": "/api/generateExport/**", 
      "function": "generateExport",
      "region": "us-central1"
    }
  ]
}
```

This allows production builds to use relative URLs instead of absolute Firebase Functions URLs.

## Deployment Process

### For Firebase Hosting

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

The smart environment detection will automatically handle the correct endpoints.

### For Other Hosting Providers

If deploying to platforms other than Firebase Hosting, ensure these environment variables are set:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
# Functions URL will be auto-detected based on hostname
```

## Testing the Configuration

### Local Development
1. Start Firebase emulators: `firebase emulators:start`
2. Run the app: `npm run dev`
3. Test document import - should hit `localhost:5001`

### Production
1. Deploy: `npm run build && firebase deploy`
2. Test on your live site
3. Check network tab - should hit `/api/parseDocument/parse`

## Troubleshooting

### Still hitting wrong endpoints?
1. Clear browser cache and reload
2. Check the console logs for "Sending request to:" messages
3. Verify the URL in the network tab

### Local emulator not working?
1. Ensure emulators are running: `firebase emulators:start`
2. Check that the emulator URL in `.env.development` matches your project ID

### Production functions not working?
1. Verify functions are deployed: `firebase functions:list`
2. Check Firebase Console for function errors
3. Ensure Firebase Hosting rewrites are configured correctly

### Getting "Unexpected token '<'" JSON error?
This error means the app is getting HTML instead of JSON from the API call. This happens when Firebase Hosting rewrites are missing or incorrect.

**Solution:**
1. Check that `firebase.json` includes the rewrites:
   ```json
   "rewrites": [
     {
       "source": "/api/parseDocument/**",
       "function": "parseDocument",
       "region": "us-central1"
     },
     {
       "source": "/api/generateExport/**", 
       "function": "generateExportHttp",
       "region": "us-central1"
     }
   ]
   ```
2. Redeploy hosting: `firebase deploy --only hosting`
3. Test in browser network tab - should see `/api/parseDocument/parse` returning JSON, not HTML

### API calls returning 404?
1. Verify the function names in rewrites match deployed functions: `firebase functions:list`
2. Check that functions are deployed in the correct region (`us-central1`)
3. Ensure the rewrite patterns match the URL paths being called

## Security Notes

- API keys in environment files are public (client-side)
- Sensitive operations happen in Firebase Functions (server-side)
- OpenAI API keys are stored securely in Firebase Functions environment variables
- Never commit production-only secrets to version control 
