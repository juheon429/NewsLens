import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChats } from '@/context/chat-context';
import { colors } from '@/theme/colors';

export default function ChatHistoryScreen() {
  const { rooms } = useChats();
  const sortedRooms = [...rooms].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>채팅 기록</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.roomTime}>{room.updatedLabel}</Text>
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
});
