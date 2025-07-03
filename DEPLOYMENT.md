# Netlify Deployment Guide for Video Conference App

## 🚀 Quick Deploy Steps

### 1. **Build the Project**

```bash
npm run build
```

### 2. **Deploy to Netlify**

- Upload the `dist` folder to Netlify
- Or connect your Git repository to Netlify for automatic deploys

### 3. **Configure Environment Variables** (Optional)

In Netlify dashboard → Site settings → Environment variables:

```
VITE_JITSI_DOMAIN=meet.jit.si
VITE_APP_NAME=Video Conference
```

## 🔧 Important Fixes Applied for Production

### ✅ HTTPS & Security

- Added proper Content Security Policy headers
- Configured Permissions Policy for camera/microphone access
- Added crossOrigin attribute to Jitsi script loading

### ✅ Routing

- Added `netlify.toml` with redirect rules for React Router
- Added `_redirects` file as backup
- Configured SPA routing properly

### ✅ Browser Compatibility

- Added mobile app meta tags
- Configured viewport for mobile devices
- Added preconnect links for better performance

### ✅ Jitsi Configuration

- Updated interface config for production
- Disabled mobile app promotions
- Added proper error handling

## 🌐 After Deployment

### Camera/Microphone Access

Your app will now properly request camera/microphone permissions on HTTPS.

### Testing

1. Test both "Create Meeting" and "Join Meeting" flows
2. Verify camera/microphone permissions work
3. Test screen sharing functionality
4. Check that all routes work properly

## 🐛 Troubleshooting

### If camera still doesn't work:

1. Ensure your Netlify site is using HTTPS (should be automatic)
2. Check browser console for any CSP errors
3. Try different browsers (Chrome, Firefox, Safari)

### If routing doesn't work:

1. Verify `netlify.toml` is in the project root
2. Check that `_redirects` file is in the `public` folder
3. Ensure build output goes to `dist` folder

### If Jitsi doesn't load:

1. Check browser console for script loading errors
2. Verify Content Security Policy allows Jitsi domains
3. Try clearing browser cache

## 📱 Mobile Support

The app now includes proper mobile meta tags and should work well on mobile devices with camera access.

## 🔒 Security Features

- Content Security Policy headers
- Proper permissions for camera/microphone
- Cross-origin script loading configured
- Secure iframe embedding for Jitsi

Your app should now work perfectly on Netlify! 🎉
