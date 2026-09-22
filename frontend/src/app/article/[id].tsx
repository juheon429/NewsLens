import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useArticle } from '@/hooks/use-news-api';
import { colors } from '@/theme/colors';

function getDomain(url: string) {
  return url.replace(/^https?:\/\//, '').split('/')[0];
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: article, error, loading, reload } = useArticle(id);
  const drag = useMemo(() => new Animated.ValueXY({ x: 0, y: 0 }), []);
  const clusterId = article?.cluster?.id;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_event, gesture) => {
          drag.extractOffset();
          if (Math.abs(gesture.dx) < 6 && Math.abs(gesture.dy) < 6 && clusterId) {
            router.push({ pathname: '/chat/[id]', params: { id: clusterId } });
          }
        },
      }),
    [clusterId, drag],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.browserBar}>
          <Pressable hitSlop={12} onPress={() => router.back()}>
            <MaterialCommunityIcons color={colors.text} name="arrow-left" size={27} />
          </Pressable>
        </View>
        <View style={styles.errorState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.errorDescription}>기사를 불러오고 있습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.browserBar}>
          <Pressable hitSlop={12} onPress={() => router.back()}>
            <MaterialCommunityIcons color={colors.text} name="arrow-left" size={27} />
          </Pressable>
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>기사를 불러오지 못했습니다</Text>
          <Text style={styles.errorDescription}>{error ?? '기사를 찾을 수 없습니다.'}</Text>
          <Pressable onPress={reload} style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.browserBar}>
        <Pressable accessibilityLabel="뒤로가기" hitSlop={12} onPress={() => router.back()}>
          <MaterialCommunityIcons color={colors.text} name="arrow-left" size={27} />
        </Pressable>
        <View style={styles.addressBar}>
          <MaterialCommunityIcons color={colors.textTertiary} name="lock-outline" size={15} />
          <Text numberOfLines={1} style={styles.domain}>
            {getDomain(article.url)}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="외부 브라우저에서 열기"
          hitSlop={12}
          onPress={() => Linking.openURL(article.url)}
        >
          <MaterialCommunityIcons color={colors.textSecondary} name="open-in-new" size={25} />
        </Pressable>
      </View>

      <View style={styles.webContainer}>
        <WebView
          originWhitelist={['https://*']}
          renderError={() => (
            <View style={styles.errorState}>
              <MaterialCommunityIcons color={colors.textTertiary} name="wifi-off" size={40} />
              <Text style={styles.errorTitle}>원문을 불러오지 못했습니다</Text>
              <Text style={styles.errorDescription}>네트워크 연결을 확인하거나 외부 브라우저로 열어주세요.</Text>
            </View>
          )}
          setSupportMultipleWindows={false}
          source={{ uri: article.url }}
          startInLoadingState
          style={styles.webView}
        />

        {clusterId ? (
          <Animated.View
            accessibilityHint="끌어서 이동하거나 눌러 AI 대화를 엽니다"
            accessibilityLabel="AI 챗봇 열기"
            style={[styles.floatingChat, { transform: drag.getTranslateTransform() }]}
            {...panResponder.panHandlers}
          >
            <MaterialCommunityIcons color="#FFFFFF" name="robot-outline" size={29} />
          </Animated.View>
        ) : null}

        {article.cluster?.representativeTitle ? (
          <View pointerEvents="none" style={styles.articleContext}>
            <Text numberOfLines={1} style={styles.contextText}>
              {article.cluster.representativeTitle}
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  browserBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 13,
    minHeight: 62,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addressBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  domain: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
  },
  webContainer: {
    flex: 1,
  },
  webView: {
    backgroundColor: colors.background,
    flex: 1,
  },
  floatingChat: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 3,
    bottom: 64,
    elevation: 8,
    height: 64,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#15231C',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    width: 64,
  },
  articleContext: {
    backgroundColor: 'rgba(46, 78, 63, 0.94)',
    borderRadius: 12,
    bottom: 12,
    left: 20,
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  contextText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  errorState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  errorDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
