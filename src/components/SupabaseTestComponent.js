/**
 * SupabaseTestComponent - Comprehensive testing component for Supabase integration
 * 
 * This component tests all Supabase functionality and validates data integrity.
 * Use this during development to ensure everything works correctly.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import SupabaseService from '../services/SupabaseService';
import { testSupabaseConnection } from '../config/supabaseConfig';
import { useNetworkStatus } from '../utils/NetworkUtils';
import { COLORS } from '../constants/theme';

const SupabaseTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { isOnline, connectionType } = useNetworkStatus();

  const addTestResult = (testName, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now() + Math.random(),
      testName,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    clearResults();

    try {
      // Test 1: Connection Test
      addTestResult('Connection Test', false, 'Testing...', null);
      try {
        const connectionResult = await testSupabaseConnection();
        addTestResult('Connection Test', connectionResult, 
          connectionResult ? 'Successfully connected to Supabase' : 'Failed to connect to Supabase');
      } catch (error) {
        addTestResult('Connection Test', false, `Connection error: ${error.message}`);
      }

      // Test 2: Get All Treks
      addTestResult('Get All Treks', false, 'Testing...', null);
      try {
        const allTreks = await SupabaseService.getAllTreks(true);
        const success = Array.isArray(allTreks) && allTreks.length > 0;
        addTestResult('Get All Treks', success, 
          success ? `Retrieved ${allTreks.length} treks` : 'No treks found', 
          { count: allTreks?.length || 0 });
      } catch (error) {
        addTestResult('Get All Treks', false, `Error: ${error.message}`);
      }

      // Test 3: Get Treks by Category
      const categories = ['fort', 'trek', 'waterfall', 'cave'];
      for (const category of categories) {
        addTestResult(`Get ${category}s`, false, 'Testing...', null);
        try {
          const categoryTreks = await SupabaseService.getTreksByCategory(category, true);
          const success = Array.isArray(categoryTreks);
          addTestResult(`Get ${category}s`, success, 
            success ? `Retrieved ${categoryTreks.length} ${category}s` : `Failed to get ${category}s`,
            { count: categoryTreks?.length || 0 });
        } catch (error) {
          addTestResult(`Get ${category}s`, false, `Error: ${error.message}`);
        }
      }

      // Test 4: Get Featured Treks
      addTestResult('Get Featured Treks', false, 'Testing...', null);
      try {
        const featuredTreks = await SupabaseService.getFeaturedTreks(true);
        const success = Array.isArray(featuredTreks);
        addTestResult('Get Featured Treks', success, 
          success ? `Retrieved ${featuredTreks.length} featured treks` : 'Failed to get featured treks',
          { count: featuredTreks?.length || 0 });
      } catch (error) {
        addTestResult('Get Featured Treks', false, `Error: ${error.message}`);
      }

      // Test 5: Search Functionality
      addTestResult('Search Test', false, 'Testing...', null);
      try {
        const searchResults = await SupabaseService.searchTreks('Raigad');
        const success = Array.isArray(searchResults);
        addTestResult('Search Test', success, 
          success ? `Found ${searchResults.length} results for "Raigad"` : 'Search failed',
          { query: 'Raigad', count: searchResults?.length || 0 });
      } catch (error) {
        addTestResult('Search Test', false, `Error: ${error.message}`);
      }

      // Test 6: Get Trek by ID
      addTestResult('Get Trek by ID', false, 'Testing...', null);
      try {
        const trek = await SupabaseService.getTrekById(1);
        const success = trek && trek.id === 1;
        addTestResult('Get Trek by ID', success, 
          success ? `Retrieved trek: ${trek.name}` : 'Failed to get trek by ID',
          { trekName: trek?.name });
      } catch (error) {
        addTestResult('Get Trek by ID', false, `Error: ${error.message}`);
      }

      // Test 7: Get Nearby Treks (using Mumbai coordinates)
      addTestResult('Get Nearby Treks', false, 'Testing...', null);
      try {
        const nearbyTreks = await SupabaseService.getNearbyTreks(19.0760, 72.8777, 100, 5);
        const success = Array.isArray(nearbyTreks);
        addTestResult('Get Nearby Treks', success, 
          success ? `Found ${nearbyTreks.length} nearby treks` : 'Failed to get nearby treks',
          { count: nearbyTreks?.length || 0 });
      } catch (error) {
        addTestResult('Get Nearby Treks', false, `Error: ${error.message}`);
      }

      // Test 8: Get Metadata
      addTestResult('Get Metadata', false, 'Testing...', null);
      try {
        const metadata = await SupabaseService.getMetadata(true);
        const success = metadata && metadata.totalCount > 0;
        addTestResult('Get Metadata', success, 
          success ? `Total count: ${metadata.totalCount}, Source: ${metadata.source}` : 'Failed to get metadata',
          metadata);
      } catch (error) {
        addTestResult('Get Metadata', false, `Error: ${error.message}`);
      }

      // Test 9: Cache Test
      addTestResult('Cache Test', false, 'Testing...', null);
      try {
        const startTime = Date.now();
        await SupabaseService.getAllTreks(); // Should use cache
        const endTime = Date.now();
        const success = (endTime - startTime) < 1000; // Should be fast if cached
        addTestResult('Cache Test', success, 
          success ? `Cache working (${endTime - startTime}ms)` : `Cache may not be working (${endTime - startTime}ms)`);
      } catch (error) {
        addTestResult('Cache Test', false, `Error: ${error.message}`);
      }

    } catch (error) {
      addTestResult('Test Suite', false, `Test suite error: ${error.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getSuccessRate = () => {
    if (testResults.length === 0) return 0;
    const successCount = testResults.filter(result => result.success).length;
    return Math.round((successCount / testResults.length) * 100);
  };

  const showTestDetails = (result) => {
    Alert.alert(
      result.testName,
      `Status: ${result.success ? 'PASS' : 'FAIL'}\n` +
      `Message: ${result.message}\n` +
      `Time: ${result.timestamp}` +
      (result.data ? `\nData: ${JSON.stringify(result.data, null, 2)}` : ''),
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Integration Test</Text>
        <Text style={styles.networkStatus}>
          Network: {isOnline ? `Online (${connectionType})` : 'Offline'}
        </Text>
        {testResults.length > 0 && (
          <Text style={styles.successRate}>
            Success Rate: {getSuccessRate()}% ({testResults.filter(r => r.success).length}/{testResults.length})
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.runButton]}
          onPress={runAllTests}
          disabled={isRunningTests}
        >
          <Text style={styles.buttonText}>
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
          disabled={isRunningTests}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={[
              styles.resultItem,
              { backgroundColor: result.success ? COLORS.success + '20' : COLORS.error + '20' }
            ]}
            onPress={() => showTestDetails(result)}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>
                {result.success ? '✅' : '❌'}
              </Text>
              <Text style={styles.resultName}>{result.testName}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            <Text style={styles.resultMessage}>{result.message}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  networkStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  successRate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  runButton: {
    backgroundColor: COLORS.primary,
  },
  clearButton: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resultMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 24,
  },
});

export default SupabaseTestComponent;
