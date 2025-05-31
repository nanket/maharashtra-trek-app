# Maharashtra Trek App

A React Native mobile application for trek lovers in Maharashtra, featuring information about forts, waterfalls, and trekking trails.

## Features

- 📱 **Cross-platform**: Built with React Native + Expo
- 🏰 **Forts**: Historic forts and citadels information
- 💧 **Waterfalls**: Beautiful cascades and falls details
- ⛰️ **Treks**: Adventure trails and peaks guide
- 📍 **Location Details**: How to reach, difficulty levels, duration
- 🗺️ **Interactive Maps**: Google Maps/Apple Maps integration with offline demo
- 📞 **Local Contacts**: Contact information for guides and emergency
- 🎨 **Clean UI**: Modern and intuitive user interface

## Project Structure

```
maharashtra-trek/
├── App.js                          # Main app entry point
├── src/
│   ├── components/
│   │   ├── TrekCard.js             # Trek card component
│   │   ├── MapView.js              # Interactive Mapbox component
│   │   ├── LocationDetailsModal.js # Location popup modal
│   │   └── OfflineMapManager.js    # Offline map downloads
│   ├── screens/
│   │   ├── HomeScreen.js           # Home screen with categories
│   │   ├── TrekListScreen.js       # List of treks with filtering
│   │   ├── TrekDetailsScreen.js    # Detailed trek information
│   │   └── MapScreen.js            # Interactive map screen
│   ├── navigation/
│   │   └── AppNavigator.js         # Navigation setup
│   ├── data/
│   │   └── treksData.json          # Static trek data
│   ├── config/
│   │   └── mapbox.js               # Mapbox configuration
│   └── utils/
│       └── constants.js            # App constants and colors
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd maharashtra-trek
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Scan the QR code with Expo Go app on your mobile device

## Data Structure

Each trek/destination includes:

- **Basic Info**: Name, category, location, difficulty, duration
- **Description**: Detailed information about the destination
- **How to Reach**: Transportation options (train, bus, private vehicle)
- **Best Time to Visit**: Recommended visiting periods
- **Local Contacts**: Guide and emergency contact information
- **Coordinates**: GPS coordinates for map integration
- **Images**: Placeholder image URLs

## Categories

- **Forts** 🏰: Historic forts and citadels
- **Waterfalls** 💧: Natural waterfalls and cascades
- **Treks** ⛰️: Mountain trails and trekking routes

## Map Features

### 🗺️ **Interactive Maps**
- **Google Maps/Apple Maps**: Native mapping with multiple types
- **Offline Demo**: Simulated offline functionality for education
- **Location Tracking**: Current position with navigation
- **Search & Filter**: Find locations by name or category
- **Custom Markers**: Category-specific markers (forts, waterfalls, treks)
- **Route Planning**: Integration with external navigation apps

### 📱 **Offline Demo Functionality**
- **Regional Downloads**: Simulated downloads for Pune, Mumbai, Nashik, Kolhapur
- **Storage Management**: Demo progress tracking and deletion
- **Educational Purpose**: Shows how offline maps would work
- **Future Enhancement**: Ready for real offline implementation

## Future Enhancements

- [ ] Route planning between multiple locations
- [ ] Elevation profiles for treks
- [ ] Weather overlay integration
- [ ] User reviews and ratings
- [ ] Photo gallery for each destination
- [ ] Bookmark/favorites functionality
- [ ] Social sharing features
- [ ] Push notifications for weather alerts

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Native Maps**: Google Maps/Apple Maps integration
- **React Navigation**: Navigation library
- **Expo Location**: Device location services
- **JavaScript**: Programming language

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or suggestions, please contact the development team.
