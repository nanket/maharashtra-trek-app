# Offline Maps Setup Guide

## 🚀 Quick Start

Your Maharashtra Trek app now has **real offline maps functionality** using Mapbox SDK! Here's how to get started:

## ⚠️ Important: Development Build Required

**Mapbox requires a development build** - it won't work in Expo Go. You'll need to create a development build to use the offline maps feature.

## 📋 Setup Steps

### 1. Create Development Build

Since Mapbox requires native code, you need to create a development build:

```bash
# For Android
expo run:android

# For iOS  
expo run:ios
```

This will create a development build with Mapbox SDK integrated.

### 2. Launch the App

Once the development build is installed on your device/emulator:

1. Open the Maharashtra Trek app
2. Navigate to the **Maps** tab
3. You'll see a new **"Mapbox"** toggle button in the header

### 3. Enable Mapbox Maps

1. Tap the **"Mapbox"** button to switch from Google Maps to Mapbox
2. The map will reload with Mapbox rendering
3. You'll see an **"Offline"** indicator when offline regions are available

### 4. Download Offline Maps

1. Tap the **"📱 Download"** button in the header
2. Select Maharashtra regions you want to download:
   - **Pune Region** (45 MB) - Pune, Sinhagad, Rajgad
   - **Mumbai Region** (38 MB) - Mumbai and nearby spots
   - **Nashik Region** (42 MB) - Nashik and Western Ghats
   - **Satara Region** (52 MB) - Satara, Mahabaleshwar
   - **Kolhapur Region** (35 MB) - Southern Maharashtra
   - **Aurangabad Region** (40 MB) - Ajanta, Ellora caves
3. Tap **"Download"** for desired regions
4. Wait for download to complete (progress shown)

### 5. Use Offline Maps

1. Once downloaded, maps work without internet!
2. The button will show **"📱 Offline"** when offline regions are active
3. Navigate to any trek location and it will load from offline storage
4. Toggle between **Google Maps** and **Mapbox** anytime

## 🎯 Key Features

### ✅ What Works Offline
- **Map Viewing**: Full map tiles cached locally
- **Location Markers**: All trek/fort/waterfall locations
- **User Location**: GPS positioning works offline
- **Trek Details**: View location maps for individual treks
- **Search**: Find locations within downloaded regions
- **Navigation**: Basic map navigation and zooming

### ✅ Map Provider Toggle
- **Google Maps**: Original implementation (online only)
- **Mapbox**: New implementation with offline support
- **Seamless Switching**: Toggle between providers anytime
- **Feature Parity**: Both support all existing functionality

### ✅ Storage Management
- **Download Progress**: Real-time download tracking
- **Storage Usage**: See total space used by offline maps
- **Region Management**: Delete regions to free up space
- **Smart Caching**: Optimized storage with zoom levels 8-16

## 📱 User Interface

### Map Screen
- **Provider Toggle**: "Google" ↔ "Mapbox" button
- **Offline Button**: "📱 Download" → "📱 Offline" when active
- **Map Style**: Maintains clean, modern design
- **Offline Indicator**: Shows when offline mode is active

### Trek Details
- **Map Toggle**: Switch providers on individual trek pages
- **Offline Support**: View trek maps even without internet
- **Consistent Design**: Same UI across both map providers

## 🔧 Technical Details

### Storage Requirements
- **Per Region**: 35-52 MB depending on area coverage
- **Total Maharashtra**: ~250 MB for all regions
- **Zoom Levels**: 8-16 (optimized for trekking use)
- **Format**: Vector tiles (efficient storage)

### Network Usage
- **Download Only**: Maps only download when you choose
- **No Background**: No automatic updates or background downloads
- **Resume Support**: Interrupted downloads can be resumed
- **Efficient**: Only downloads selected regions

## 🛠️ Troubleshooting

### If Mapbox Button Doesn't Appear
1. Ensure you're using a development build (not Expo Go)
2. Check that @rnmapbox/maps is installed
3. Restart the app after creating development build

### If Downloads Fail
1. Check internet connection during download
2. Ensure sufficient storage space on device
3. Try downloading smaller regions first
4. Restart app and try again

### If Maps Don't Load Offline
1. Verify region was fully downloaded (check storage section)
2. Ensure you're in the downloaded region boundaries
3. Toggle airplane mode to test true offline functionality
4. Check that Mapbox provider is selected

## 🎉 Benefits for Trekkers

### 🏔️ Perfect for Remote Areas
- **No Internet Required**: Maps work in remote mountain areas
- **Reliable Navigation**: Never lose your way due to poor signal
- **Battery Efficient**: Offline maps use less battery than online
- **Fast Loading**: Instant map loading from local storage

### 📊 Data Savings
- **Zero Data Usage**: No internet required after download
- **One-Time Download**: Download once, use forever
- **Selective Regions**: Only download areas you need
- **Efficient Storage**: Optimized for mobile devices

## 🔄 Next Steps

1. **Create Development Build**: `expo run:android` or `expo run:ios`
2. **Test Offline Functionality**: Download a region and test in airplane mode
3. **Explore Features**: Try both Google Maps and Mapbox providers
4. **Download Your Regions**: Get offline maps for your favorite trekking areas

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Ensure you're using a development build
3. Verify Mapbox access token is configured
4. Test with a simple region download first

**Enjoy your offline trekking adventures! 🏔️📱**
