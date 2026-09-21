import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewsCard } from '@/components/news-card';
import { categories, newsClusters } from '@/data/mock-news';
import { colors } from '@/theme/colors';
import { CategoryFilter } from '@/types/news';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('전체');
  const [selectedPeriod, setSelectedPeriod] = useState<'하루' | '1주일' | '2주일'>('하루');
  const [query, setQuery] = useState('');

  const filteredNews = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    const periodHours = selectedPeriod === '하루' ? 24 : selectedPeriod === '1주일' ? 168 : 336;
    return newsClusters.filter((cluster) => {
      const inCategory = selectedCategory === '전체' || cluster.category === selectedCategory;
      const matchesTitle =
        !normalizedQuery ||
        cluster.representativeTitle.toLocaleLowerCase('ko-KR').includes(normalizedQuery);
      const inPeriod = cluster.ageInHours <= periodHours;
      return inCategory && matchesTitle && inPeriod;
    });
  }, [query, selectedCategory, selectedPeriod]);

  const openCluster = (clusterId: string) => {
    router.push({ pathname: '/cluster/[id]', params: { id: clusterId } });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.brandTitle}>뉴스큐레이션</Text>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons color={colors.textTertiary} name="magnify" size={25} />
          <TextInput
            accessibilityLabel="뉴스 제목 검색"
            onChangeText={setQuery}
            placeholder="뉴스 제목으로 검색"
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
          {query ? (
            <Pressable accessibilityLabel="검색어 지우기" hitSlop={10} onPress={() => setQuery('')}>
              <MaterialCommunityIcons color={colors.textTertiary} name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.categories}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const selected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryButton, selected && styles.categoryButtonSelected]}
              >
                <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{query ? '검색 결과' : '주요 뉴스'}</Text>
          <Text style={styles.updatedText}>{filteredNews.length}개 뉴스</Text>
        </View>

        <View style={styles.periodSelector}>
          {(['하루', '1주일', '2주일'] as const).map((period) => {
            const selected = selectedPeriod === period;
            return (
              <Pressable
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[styles.periodButton, selected && styles.periodButtonSelected]}
              >
                <Text style={[styles.periodLabel, selected && styles.periodLabelSelected]}>
                  {period}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredNews.length ? (
          <View style={styles.newsList}>
            {filteredNews.map((cluster) => (
              <NewsCard
                cluster={cluster}
                key={cluster.id}
                onPress={() => openCluster(cluster.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons color={colors.textTertiary} name="newspaper-remove" size={38} />
            <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
            <Text style={styles.emptyDescription}>다른 뉴스 제목을 검색해 보세요.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.45,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    height: 52,
  },
  categories: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  categoryButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  updatedText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  periodSelector: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 11,
    flexDirection: 'row',
    marginBottom: 14,
    marginHorizontal: 20,
    padding: 4,
  },
  periodButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 9,
  },
  periodButtonSelected: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: '#15231C',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  periodLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  periodLabelSelected: {
    color: colors.primary,
    fontWeight: '900',
  },
  newsList: {
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 70,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
});
