import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle, CATEGORY_COLORS, IMAGES } from '../utils/constants';
import UserStorageService from '../utils/userStorage';
import LocalDataService from '../services/LocalDataService';
import TrekCard from './TrekCard';

const { width } = Dimensions.get('window');

const FavoritesTab = ({ navigation, favorites, onFavoritesChange }) => {
  const [favoriteTraks, setFavoriteTraks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavoriteTraks();
  }, [favorites]);

  const loadFavoriteTraks = () => {
    const allData = LocalDataService.getAllData();
    const favTraks = allData.filter(trek => favorites.includes(trek.id));
    setFavoriteTraks(favTraks);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload favorites from storage
      const updatedFavorites = await UserStorageService.getFavorites();
      onFavoritesChange(updatedFavorites);
      loadFavoriteTraks();
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveFromFavorites = async (trekId) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this trek from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const updatedFavorites = await UserStorageService.removeFromFavorites(trekId);
              onFavoritesChange(updatedFavorites);
            } catch (error) {
              console.error('Error removing from favorites:', error);
              Alert.alert('Error', 'Failed to remove from wishlist');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTrekPress = (trek) => {
    navigation.navigate('TrekDetails', { trek });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.emptyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Start exploring and add treks you'd love to visit!
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.exploreButtonText}>Explore Treks</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderFavoriteCard = ({ item }) => (
    <View style={styles.favoriteCard}>
      <TrekCard
        trek={item}
        onPress={handleTrekPress}
        showFavoriteButton={false}
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromFavorites(item.id)}
        disabled={loading}
      >
        <Text style={styles.removeButtonText}>Remove from Wishlist</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>
        My Wishlist ({favoriteTraks.length})
      </Text>
      <Text style={styles.headerSubtitle}>
        Treks you want to explore
      </Text>
    </View>
  );

  if (favoriteTraks.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteTraks}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    ...createTextStyle(24, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  favoriteCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    alignItems: 'center',
  },
  removeButtonText: {
    ...createTextStyle(14, 'medium'),
    color: COLORS.textInverse,
  },
  emptyContainer: {
    flex: 1,
    marginTop: SPACING.xxl,
  },
  emptyGradient: {
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...createTextStyle(20, 'bold'),
    color: COLORS.textInverse,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...createTextStyle(14, 'regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  exploreButtonText: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.textInverse,
  },
});

export default FavoritesTab;
