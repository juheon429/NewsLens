import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { NewsClusterSummary } from '@/types/news';

interface NewsCardProps {
  cluster: NewsClusterSummary;
  onPress: () => void;
}

export function NewsCard({ cluster, onPress }: NewsCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardCopy}>
        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{cluster.category}</Text>
          </View>
          <Text style={styles.time}>{cluster.publishedLabel}</Text>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {cluster.representativeTitle}
        </Text>

        <View style={styles.footer}>
          <MaterialCommunityIcons
            color={colors.textSecondary}
            name="newspaper-variant-outline"
            size={13}
          />
          <Text style={styles.footerText}>{cluster.publisherCount}개 언론사</Text>
          <Text style={styles.footerText}>·</Text>
          <Text style={styles.footerText}>{cluster.articleCount}건 묶음</Text>
        </View>
      </View>

      {cluster.imageUrl ? (
        <Image source={{ uri: cluster.imageUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnail} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    height: 124,
    padding: 14,
  },
  pressed: {
    opacity: 0.76,
  },
  cardCopy: {
    flex: 1,
    gap: 7,
    paddingRight: 13,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  categoryPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  categoryText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  time: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  thumbnail: {
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    height: 88,
    width: 88,
  },
});
