# GitHub CI/CD Data Service Setup Guide

This guide explains how to set up GitHub CI/CD to manage fort/trek data instead of using local files.

## Overview

The new data service provides:
- ✅ Remote data fetching from GitHub Pages
- ✅ Automatic data validation via GitHub Actions
- ✅ Local fallback when remote data is unavailable
- ✅ Intelligent caching for better performance
- ✅ Easy data updates through GitHub

## Setup Steps

### 1. Create Data Repository

Create a new GitHub repository for your trek data (recommended name: `maharashtra-trek-data`):

```bash
# Create new repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/maharashtra-trek-data.git
cd maharashtra-trek-data

# Copy your data files
mkdir -p src/data
cp /path/to/your/current/data/*.json src/data/

# Copy the scripts
mkdir scripts
cp /path/to/maharashtra-trek/scripts/* scripts/

# Copy package.json (minimal version for scripts)
echo '{
  "name": "maharashtra-trek-data",
  "version": "1.0.0",
  "scripts": {
    "validate": "node scripts/validateData.js",
    "build": "node scripts/updateData.js"
  }
}' > package.json
```

### 2. Set up GitHub Actions

Create `.github/workflows/data-sync.yml` in your data repository:

```yaml
# Copy the workflow file from this project
cp /path/to/maharashtra-trek/.github/workflows/data-sync.yml .github/workflows/
```

### 3. Enable GitHub Pages

1. Go to your data repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy to GitHub Pages

### 4. Update App Configuration

Update `src/config/dataConfig.js` in your main app:

```javascript
export const DATA_CONFIG = {
  // Replace with your actual GitHub Pages URL
  BASE_URL: 'https://YOUR_USERNAME.github.io/maharashtra-trek-data/api',
  // ... rest of config
};
```

### 5. Update Components to Use Data Service

Replace direct JSON imports with the data service:

#### Before (HomeScreen.js):
```javascript
import treksData from '../data/treksData.json';

const HomeScreen = ({ navigation }) => {
  const topTreks = treksData.filter(trek => trek.featured);
  // ...
};
```

#### After (HomeScreen.js):
```javascript
import { useFeaturedTreks } from '../hooks/useDataService';

const HomeScreen = ({ navigation }) => {
  const { featuredTreks: topTreks, loading, error } = useFeaturedTreks();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error) {
    console.warn('Using fallback data:', error);
  }
  // ...
};
```

## Usage Examples

### Getting All Treks
```javascript
import { useAllTreks } from '../hooks/useDataService';

const TrekListScreen = () => {
  const { treks, loading, error, refresh } = useAllTreks();
  
  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error}</Text>}
      <FlatList data={treks} renderItem={renderTrek} />
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
};
```

### Getting Treks by Category
```javascript
import { useTreksByCategory } from '../hooks/useDataService';

const FortsScreen = () => {
  const { treks: forts, loading, error } = useTreksByCategory('fort');
  // ...
};
```

### Manual Data Operations
```javascript
import { useDataService } from '../hooks/useDataService';

const SettingsScreen = () => {
  const { refreshAllData, clearCache, loading } = useDataService();
  
  const handleRefresh = async () => {
    await refreshAllData();
    Alert.alert('Success', 'Data refreshed successfully');
  };
  
  return (
    <View>
      <Button title="Refresh Data" onPress={handleRefresh} disabled={loading} />
      <Button title="Clear Cache" onPress={clearCache} />
    </View>
  );
};
```

### Search Functionality
```javascript
import { useSearchTreks } from '../hooks/useDataService';

const SearchScreen = () => {
  const { results, loading, search, clearResults } = useSearchTreks();
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    search(query, 'fort'); // Optional category filter
  };
  
  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />
      <Button title="Search" onPress={handleSearch} />
      {loading && <ActivityIndicator />}
      <FlatList data={results} renderItem={renderResult} />
    </View>
  );
};
```

## Data Management Workflow

### Adding New Trek Data

1. **Create JSON file** in your data repository:
```bash
# In maharashtra-trek-data repository
cd src/data
# Create new file: New_Fort.json
```

2. **Validate locally**:
```bash
npm run validate
```

3. **Commit and push**:
```bash
git add .
git commit -m "Add New Fort data"
git push origin main
```

4. **GitHub Actions will**:
   - Validate the data
   - Generate API endpoints
   - Deploy to GitHub Pages
   - App will automatically use new data (after cache expires)

### Updating Existing Data

1. Edit the JSON file in your data repository
2. Commit and push changes
3. GitHub Actions handles the rest

### Force App Data Refresh

Users can force refresh data in the app:
```javascript
// In your settings screen
const { refreshAllData } = useDataService();
await refreshAllData(); // Clears cache and fetches fresh data
```

## Benefits

1. **Centralized Data Management**: All trek data in one repository
2. **Automatic Validation**: GitHub Actions prevent invalid data
3. **Version Control**: Full history of data changes
4. **Collaborative**: Multiple people can contribute data
5. **Reliable**: Local fallback ensures app always works
6. **Performance**: Intelligent caching reduces network requests
7. **Scalable**: Easy to add new data types and endpoints

## Troubleshooting

### Data Not Loading
1. Check GitHub Pages deployment status
2. Verify BASE_URL in dataConfig.js
3. Check network connectivity
4. App will use local fallback automatically

### Validation Errors
1. Run `npm run validate` locally
2. Fix JSON structure issues
3. Ensure all required fields are present

### Cache Issues
1. Use `clearCache()` function
2. Or wait for cache to expire (24 hours by default)

## API Endpoints

Once deployed, your data will be available at:
- `https://YOUR_USERNAME.github.io/maharashtra-trek-data/api/all.json` - All treks
- `https://YOUR_USERNAME.github.io/maharashtra-trek-data/api/forts.json` - Only forts
- `https://YOUR_USERNAME.github.io/maharashtra-trek-data/api/featured.json` - Featured treks
- `https://YOUR_USERNAME.github.io/maharashtra-trek-data/api/metadata.json` - Data metadata

## Next Steps

1. Set up the data repository
2. Configure GitHub Pages
3. Update your app's dataConfig.js
4. Test with a few components
5. Gradually migrate all components to use the data service
6. Add new features like user-contributed data
