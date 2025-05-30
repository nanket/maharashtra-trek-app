import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TrekCard from '../components/TrekCard';
import { COLORS, CATEGORIES, CATEGORY_COLORS, SHADOWS } from '../utils/constants';
import treksData from '../data/treksData.json';

const TrekListScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [filteredTreks, setFilteredTreks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(category || 'all');

  useEffect(() => {
    filterTreks(selectedFilter);
  }, [selectedFilter]);

  const filterTreks = (filter) => {
    if (filter === 'all') {
      setFilteredTreks(treksData);
    } else {
      setFilteredTreks(treksData.filter(trek => trek.category === filter));
    }
  };

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const getScreenTitle = () => {
    switch (selectedFilter) {
      case CATEGORIES.FORT:
        return 'Forts';
      case CATEGORIES.WATERFALL:
        return 'Waterfalls';
      case CATEGORIES.TREK:
        return 'Treks';
      default:
        return 'All Destinations';
    }
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: CATEGORIES.FORT, label: 'Forts' },
    { id: CATEGORIES.WATERFALL, label: 'Waterfalls' },
    { id: CATEGORIES.TREK, label: 'Treks' },
  ];

  const renderTrekCard = ({ item }) => (
    <TrekCard trek={item} onPress={handleTrekPress} />
  );

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryLight]}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.headerContent}>
        <Text style={styles.title}>{getScreenTitle()}</Text>
        <Text style={styles.subtitle}>
          {filteredTreks.length} destination{filteredTreks.length !== 1 ? 's' : ''} found
        </Text>

        <View style={styles.filtersContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => handleFilterPress(filter.id)}
              activeOpacity={0.8}
            >
              {selectedFilter === filter.id ? (
                <LinearGradient
                  colors={[COLORS.accent, COLORS.secondary]}
                  style={styles.filterGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.filterTextActive}>
                    {filter.label}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterText}>
                  {filter.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTreks}
        renderItem={renderTrekCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.surface,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.surface,
    marginBottom: 20,
    opacity: 0.9,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  filterButton: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...SHADOWS.small,
  },
  filterButtonActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  filterGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
    opacity: 0.8,
  },
  filterTextActive: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default TrekListScreen;
