import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, createTextStyle } from '../utils/constants';
import { getTimeAgo, getPostTypeIcon, getPostTypeColor } from '../data/communityData';

const { width } = Dimensions.get('window');

const CommunityFeed = ({ posts, navigation }) => {
  const renderPost = ({ item }) => {
    const typeColor = getPostTypeColor(item.type);
    const typeIcon = getPostTypeIcon(item.type);

    return (
      <View style={[
        styles.postCard,
        item.isImportant && styles.importantPost,
        item.isSpecial && styles.specialPost
      ]}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.user.avatar}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.user.name}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.userLevel}>{item.user.level}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.postTime}>{getTimeAgo(item.timestamp)}</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.postTypeBadge, { backgroundColor: typeColor + '15' }]}>
            <Text style={styles.postTypeIcon}>{typeIcon}</Text>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          {item.trek && (
            <TouchableOpacity 
              style={styles.trekReference}
              onPress={() => {
                // Navigate to trek details if available
                // navigation.navigate('TrekDetails', { trek: item.trek });
              }}
            >
              <Text style={styles.trekReferenceText}>📍 {item.trek.name}</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.postText}>{item.content}</Text>
          
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating: </Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= item.rating && styles.starFilled
                  ]}
                >
                  ⭐
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Like pressed for post', item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>👍</Text>
            <Text style={styles.actionText}>{item.likes} likes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Comments pressed for post', item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{item.comments} comments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Share pressed for post', item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Special Post Decoration */}
        {item.isSpecial && (
          <LinearGradient
            colors={[COLORS.accent + '20', COLORS.primary + '20']}
            style={styles.specialDecoration}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.feedHeader}>
      <Text style={styles.feedTitle}>🌟 Community Feed</Text>
      <Text style={styles.feedSubtitle}>Latest updates from fellow trekkers</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🏔️</Text>
      <Text style={styles.emptyStateTitle}>No posts yet</Text>
      <Text style={styles.emptyStateText}>
        Be the first to share your trekking experience!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
        scrollEnabled={false} // Disable scroll since parent ScrollView handles it
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  feedHeader: {
    marginBottom: SPACING.lg,
  },
  feedTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  feedSubtitle: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
  },
  postCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  importantPost: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  specialPost: {
    borderWidth: 2,
    borderColor: COLORS.accent + '30',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userAvatarText: {
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...createTextStyle(14, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLevel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.primary,
  },
  metaDot: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textLight,
    marginHorizontal: SPACING.xs,
  },
  postTime: {
    ...createTextStyle(12, 'regular'),
    color: COLORS.textLight,
  },
  postTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTypeIcon: {
    fontSize: 16,
  },
  postContent: {
    marginBottom: SPACING.md,
  },
  trekReference: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  trekReferenceText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.primary,
  },
  postText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.text,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ratingLabel: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  star: {
    fontSize: 14,
    opacity: 0.3,
    marginRight: SPACING.xs,
  },
  starFilled: {
    opacity: 1,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  actionText: {
    ...createTextStyle(12, 'medium'),
    color: COLORS.textSecondary,
  },
  specialDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    ...createTextStyle(18, 'bold'),
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...createTextStyle(14, 'regular'),
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default CommunityFeed;
