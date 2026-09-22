import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChats } from '@/context/chat-context';
import { colors } from '@/theme/colors';

export default function ChatHistoryScreen() {
  const { error, leaveRoom, loading, rooms } = useChats();
  const sortedRooms = [...rooms].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const confirmLeave = (clusterId: string, title: string) => {
    Alert.alert('채팅방 나가기', `“${title}” 대화 기록을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => void leaveRoom(clusterId).catch(() => undefined),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>채팅 기록</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.emptyText}>채팅 기록을 불러오고 있습니다.</Text>
          </View>
        ) : null}
        {!loading && error && !sortedRooms.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>채팅 기록을 불러오지 못했습니다</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : null}
        {!loading && !error && !sortedRooms.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>아직 대화한 뉴스가 없습니다</Text>
            <Text style={styles.emptyText}>뉴스 브리핑에서 대화를 시작해 보세요.</Text>
          </View>
        ) : null}
        {sortedRooms.map((room) => {
          const lastMessage = room.messages.at(-1);
          return (
            <Pressable
              key={room.clusterId}
              onPress={() =>
                router.push({ pathname: '/chat/[id]', params: { id: room.clusterId } })
              }
              style={({ pressed }) => [styles.roomCard, pressed && styles.pressed]}
            >
              <View style={styles.roomCopy}>
                <View style={styles.roomTitleRow}>
                  <Text numberOfLines={1} style={styles.roomTitle}>
                    {room.title}
                  </Text>
                  <View style={styles.roomActions}>
                    <Text style={styles.roomTime}>{room.updatedLabel}</Text>
                    <Pressable
                      accessibilityLabel={`${room.title} 채팅방 나가기`}
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation();
                        confirmLeave(room.clusterId, room.title);
                      }}
                      style={({ pressed }) => [styles.leaveButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.leaveText}>나가기</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{room.category}</Text>
                </View>
                <Text numberOfLines={2} style={styles.preview}>
                  {lastMessage?.content}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCopy: {
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  list: {
    gap: 12,
    padding: 20,
  },
  roomCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    minHeight: 136,
    padding: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  roomCopy: {
    gap: 8,
  },
  roomTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  roomTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.25,
  },
  roomTime: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  roomActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  leaveButton: {
    borderColor: '#D8DDDA',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  leaveText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  categoryText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  preview: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
