# Maharashtra Trek App

A React Native mobile application for trek lovers in Maharashtra, featuring information about forts, waterfalls, and trekking trails.

## Features

- 📱 **Cross-platform**: Built with React Native + Expo
- 🏰 **Forts**: Historic forts and citadels information
- 💧 **Waterfalls**: Beautiful cascades and falls details
- ⛰️ **Treks**: Adventure trails and peaks guide
- 📍 **Location Details**: How to reach, difficulty levels, duration
- 🗺️ **Offline Map Support**: Placeholder for future offline map integration
- 📞 **Local Contacts**: Contact information for guides and emergency
- 🎨 **Clean UI**: Modern and intuitive user interface

## Project Structure

```
maharashtra-trek/
├── App.js                          # Main app entry point
├── src/
│   ├── components/
│   │   ├── TrekCard.js             # Trek card component
│   │   └── MapPlaceholder.js       # Offline map placeholder
│   ├── screens/
│   │   ├── HomeScreen.js           # Home screen with categories
│   │   ├── TrekListScreen.js       # List of treks with filtering
│   │   └── TrekDetailsScreen.js    # Detailed trek information
│   ├── navigation/
│   │   └── AppNavigator.js         # Navigation setup
│   ├── data/
│   │   └── treksData.json          # Static trek data
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

## Future Enhancements

- [ ] Offline map integration with react-native-maps
- [ ] User reviews and ratings
- [ ] Weather information integration
- [ ] Photo gallery for each destination
- [ ] Bookmark/favorites functionality
- [ ] GPS navigation integration
- [ ] Social sharing features
- [ ] Push notifications for weather alerts

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
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
