# Location Permissions Setup for iOS

## Issue
When trying to start trek tracking on iOS, you may encounter the error:
```
Failed to start tracking: one of NSLocationUsageDescription keys must be present in Info.plist
```

## Root Cause
This error occurs because iOS requires specific permission keys in the Info.plist file to access location services. When running in Expo Go, these permissions may not be properly applied.

## Solutions

### Option 1: Development Build (Recommended)
Create a development build that includes all native permissions:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Build development version**:
   ```bash
   # For iOS
   eas build --profile development --platform ios
   
   # For Android
   eas build --profile development --platform android
   ```

4. **Install the development build** on your device and test location tracking.

### Option 2: Expo Go Limitations
When using Expo Go, background location tracking has limitations:
- Location permissions may not work properly
- Background tracking is not fully supported
- Some native features are restricted

**Workaround for Expo Go:**
- The app will show a "Development Mode" alert
- Location tracking will work only in foreground
- Background tracking will be disabled

### Option 3: Local Development Build
If you have Xcode installed:

1. **Generate native code**:
   ```bash
   npx expo run:ios
   ```

2. This will create a local iOS build with proper permissions.

## Permission Keys Added
The following location permission keys have been added to `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "This app uses location to show your position on the map and provide navigation to trek locations.",
      "NSLocationAlwaysAndWhenInUseUsageDescription": "This app uses background location to track your trek progress and provide safety features even when the app is in the background.",
      "NSLocationAlwaysUsageDescription": "This app uses background location to track your trek progress and provide safety features even when the app is in the background.",
      "NSLocationUsageDescription": "This app uses location services to track your trek progress and provide navigation assistance.",
      "NSMotionUsageDescription": "This app uses motion data to track your trek activities and calculate distance and elevation.",
      "UIBackgroundModes": ["location", "background-processing"]
    }
  }
}
```

## Testing Location Features

### In Development Mode (Expo Go)
- Location tracking will work in foreground only
- You'll see a "Development Mode" alert
- Basic location features will work for testing

### In Development Build
- Full background location tracking
- All location features work properly
- Production-like experience

## Troubleshooting

### If location still doesn't work:
1. **Check device settings**:
   - Settings > Privacy & Security > Location Services (enabled)
   - Find your app and ensure location access is granted

2. **Reset permissions**:
   - Delete and reinstall the app
   - Grant permissions when prompted

3. **Check console logs**:
   - Look for location permission errors
   - Check if location services are enabled

### Error Messages and Solutions:

| Error | Solution |
|-------|----------|
| "Location permission denied" | Grant location access in device settings |
| "Location services are disabled" | Enable location services in device settings |
| "Location tracking task is not properly configured" | Restart the app or use development build |
| "Background location tracking is not available" | Use development build for full functionality |

## Production Deployment
For production apps:
1. Use EAS Build for app store deployment
2. All location permissions will work properly
3. Background tracking will be fully functional
4. Users will see proper permission prompts

## Development vs Production
- **Development (Expo Go)**: Limited location features, foreground only
- **Development Build**: Full location features, background tracking
- **Production**: Full location features, app store ready
