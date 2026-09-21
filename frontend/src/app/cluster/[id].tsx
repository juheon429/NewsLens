import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { getCluster } from '@/data/mock-news';
import { colors } from '@/theme/colors';

export default function ClusterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cluster = getCluster(id);

  if (!cluster) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="뉴스 브리핑" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>뉴스를 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openChat = () => {
    router.push({ pathname: '/chat/[id]', params: { id: cluster.id } });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScreenHeader
        subtitle={`${cluster.category} · ${cluster.publishedLabel} 업데이트`}
        title="AI 뉴스 브리핑"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          onPress={openChat}
          style={({ pressed }) => [styles.briefingCard, pressed && styles.pressed]}
        >
          <View style={styles.briefingTopRow}>
            <View style={styles.aiLabel}>
              <MaterialCommunityIcons color={colors.primary} name="robot-outline" size={17} />
              <Text style={styles.aiLabelText}>AI 사건 요약</Text>
            </View>
            <View style={styles.talkHint}>
              <MaterialCommunityIcons color={colors.primary} name="chat-outline" size={16} />
              <Text style={styles.talkHintText}>눌러서 대화하기</Text>
            </View>
          </View>
          <Text style={styles.briefingTitle}>{cluster.representativeTitle}</Text>
          <Text style={styles.summary}>{cluster.summary}</Text>
          <View style={styles.chatButton}>
            <MaterialCommunityIcons color="#FFFFFF" name="robot-outline" size={20} />
            <Text style={styles.chatButtonText}>이 뉴스로 AI와 대화 이어가기</Text>
          </View>
        </Pressable>

        <View style={styles.articleHeadingRow}>
          <Text style={styles.articleHeading}>관련 기사 {cluster.articles.length}</Text>
          <Text style={styles.articleHeadingHint}>같은 사건을 다룬 기사</Text>
        </View>

        <View style={styles.articleList}>
          {cluster.articles.map((article) => (
            <Pressable
              key={article.id}
              onPress={() =>
                router.push({ pathname: '/article/[id]', params: { id: article.id } })
              }
              style={({ pressed }) => [styles.articleCard, pressed && styles.pressed]}
            >
              <View style={styles.articleIcon}>
                <MaterialCommunityIcons
                  color={colors.primary}
                  name="newspaper-variant-outline"
                  size={21}
                />
              </View>
              <View style={styles.articleCopy}>
                <Text style={styles.publisher}>
                  {article.publisher} · {article.publishedLabel}
                </Text>
                <Text numberOfLines={2} style={styles.articleTitle}>
                  {article.title}
                </Text>
                <Text numberOfLines={1} style={styles.articleDescription}>
                  {article.description}
                </Text>
              </View>
              <MaterialCommunityIcons color="#BAC1BD" name="chevron-right" size={25} />
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons color={colors.primary} name="information-outline" size={20} />
          <Text style={styles.infoText}>
            기사를 누르면 앱 안에서 원문을 볼 수 있어요. 원문 화면의 챗봇 버튼으로 이
            뉴스에 대한 대화를 계속할 수 있습니다.
          </Text>
        </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  pressed: {
    opacity: 0.76,
  },
  briefingCard: {
    backgroundColor: colors.primaryFaint,
    borderColor: '#C9D8D0',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  briefingTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  aiLabelText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  talkHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  talkHintText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  briefingTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 29,
    marginTop: 19,
  },
  summary: {
    color: '#25322B',
    fontSize: 15,
    lineHeight: 25,
    marginBottom: 22,
    marginTop: 12,
  },
  chatButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: -20,
    paddingVertical: 17,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  articleHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 28,
  },
  articleHeading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  articleHeadingHint: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  articleList: {
    gap: 11,
  },
  articleCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 112,
    padding: 15,
  },
  articleIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 9,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  articleCopy: {
    flex: 1,
    gap: 5,
  },
  publisher: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  articleTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  articleDescription: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  infoBox: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryFaint,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 11,
    marginTop: 22,
    padding: 15,
  },
  infoText: {
    color: '#32463B',
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  notFoundTitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

