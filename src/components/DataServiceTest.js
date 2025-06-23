import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDataService, useAllTreks, useFeaturedTreks, useTreksByCategory, useDataMetadata } from '../hooks/useDataService';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, createTextStyle } from '../utils/constants';

/**
 * Test component to verify DataService functionality
 * Use this component to test remote data loading and caching
 */
const DataServiceTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Hook examples
  const { treks: allTreks, loading: allLoading, error: allError } = useAllTreks();
  const { featuredTreks, loading: featuredLoading } = useFeaturedTreks();
  const { treks: forts, loading: fortsLoading } = useTreksByCategory('fort');
  const { metadata, loading: metadataLoading } = useDataMetadata();
  const { refreshAllData, clearCache, loading: serviceLoading } = useDataService();

  const addTestResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: Get all treks
      addTestResult('Get All Treks', true, `Loaded ${allTreks.length} treks`, { count: allTreks.length });
      
      // Test 2: Get featured treks
      addTestResult('Get Featured Treks', true, `Loaded ${featuredTreks.length} featured treks`, { count: featuredTreks.length });
      
      // Test 3: Get forts
      addTestResult('Get Forts', true, `Loaded ${forts.length} forts`, { count: forts.length });
      
      // Test 4: Get metadata
      if (metadata) {
        addTestResult('Get Metadata', true, `Last updated: ${metadata.lastUpdated}`, metadata);
      } else {
        addTestResult('Get Metadata', false, 'No metadata available');
      }
      
      // Test 5: Search functionality
      const DataService = require('../services/DataService').default;
      const searchResults = await DataService.searchTreks('fort');
      addTestResult('Search Treks', true, `Found ${searchResults.length} results for "fort"`, { count: searchResults.length });
      
      // Test 6: Get specific trek
      if (allTreks.length > 0) {
        const firstTrek = await DataService.getTrekById(allTreks[0].id);
        addTestResult('Get Trek by ID', !!firstTrek, firstTrek ? `Found: ${firstTrek.name}` : 'Trek not found', firstTrek);
      }
      
    } catch (error) {
      addTestResult('Test Suite', false, `Error: ${error.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshAllData();
      Alert.alert('Success', 'Data refreshed successfully!');
      addTestResult('Refresh Data', true, 'All data refreshed from remote source');
    } catch (error) {
      Alert.alert('Error', `Failed to refresh: ${error.message}`);
      addTestResult('Refresh Data', false, error.message);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      Alert.alert('Success', 'Cache cleared successfully!');
      addTestResult('Clear Cache', true, 'All cached data cleared');
    } catch (error) {
      Alert.alert('Error', `Failed to clear cache: ${error.message}`);
      addTestResult('Clear Cache', false, error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DataService Test Console</Text>
        <Text style={styles.subtitle}>Test remote data loading and caching</Text>
      </View>

      {/* Status Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>All Treks</Text>
            <Text style={styles.statusValue}>
              {allLoading ? 'Loading...' : `${allTreks.length} items`}
            </Text>
            {allError && <Text style={styles.errorText}>Error: {allError}</Text>}
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Featured</Text>
            <Text style={styles.statusValue}>
              {featuredLoading ? 'Loading...' : `${featuredTreks.length} items`}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Forts</Text>
            <Text style={styles.statusValue}>
              {fortsLoading ? 'Loading...' : `${forts.length} items`}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Metadata</Text>
            <Text style={styles.statusValue}>
              {metadataLoading ? 'Loading...' : metadata ? 'Available' : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={runAllTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Run All Tests</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleRefreshData}
            disabled={serviceLoading}
          >
            <Text style={styles.buttonTextSecondary}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleClearCache}
            disabled={serviceLoading}
          >
            <Text style={styles.buttonTextSecondary}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          
          {testResults.map((result, index) => (
            <View key={index} style={[styles.testResult, result.success ? styles.testSuccess : styles.testFailure]}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{result.test}</Text>
                <Text style={styles.testStatus}>{result.success ? '✅' : '❌'}</Text>
                <Text style={styles.testTime}>{result.timestamp}</Text>
              </View>
              <Text style={styles.testMessage}>{result.message}</Text>
              {result.data && (
                <Text style={styles.testData}>
                  Data: {JSON.stringify(result.data, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Metadata Display */}
      {metadata && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Metadata</Text>
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>
              Last Updated: {new Date(metadata.lastUpdated).toLocaleString()}
            </Text>
            <Text style={styles.metadataText}>
              Total Count: {metadata.totalCount}
            </Text>
            <Text style={styles.metadataText}>
              Version: {metadata.version}
            </Text>
            {metadata.categories && (
              <View style={styles.categoriesContainer}>
                <Text style={styles.metadataText}>Categories:</Text>
                {metadata.categories.map((cat, index) => (
                  <Text key={index} style={styles.categoryText}>
                    • {cat.name}: {cat.count} items
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  title: {
    ...createTextStyle(FONTS.bold, 24, COLORS.white),
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...createTextStyle(FONTS.regular, 16, COLORS.white),
    opacity: 0.9,
  },
  section: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  sectionTitle: {
    ...createTextStyle(FONTS.bold, 18, COLORS.text),
    marginBottom: SPACING.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    ...createTextStyle(FONTS.medium, 14, COLORS.textSecondary),
    marginBottom: SPACING.xs,
  },
  statusValue: {
    ...createTextStyle(FONTS.bold, 16, COLORS.text),
  },
  errorText: {
    ...createTextStyle(FONTS.regular, 12, COLORS.error),
    marginTop: SPACING.xs,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    minWidth: '48%',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    ...createTextStyle(FONTS.medium, 16, COLORS.white),
  },
  buttonTextSecondary: {
    ...createTextStyle(FONTS.medium, 16, COLORS.primary),
  },
  testResult: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  testSuccess: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  testFailure: {
    backgroundColor: '#ffeaea',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  testName: {
    ...createTextStyle(FONTS.medium, 16, COLORS.text),
    flex: 1,
  },
  testStatus: {
    fontSize: 16,
    marginHorizontal: SPACING.sm,
  },
  testTime: {
    ...createTextStyle(FONTS.regular, 12, COLORS.textSecondary),
  },
  testMessage: {
    ...createTextStyle(FONTS.regular, 14, COLORS.text),
    marginBottom: SPACING.xs,
  },
  testData: {
    ...createTextStyle(FONTS.regular, 12, COLORS.textSecondary),
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    fontFamily: 'monospace',
  },
  metadataContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  metadataText: {
    ...createTextStyle(FONTS.regular, 14, COLORS.text),
    marginBottom: SPACING.xs,
  },
  categoriesContainer: {
    marginTop: SPACING.sm,
  },
  categoryText: {
    ...createTextStyle(FONTS.regular, 14, COLORS.textSecondary),
    marginLeft: SPACING.md,
    marginBottom: SPACING.xs,
  },
});

export default DataServiceTest;
