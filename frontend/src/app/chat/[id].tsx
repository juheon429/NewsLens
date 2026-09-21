import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { useChats } from '@/context/chat-context';
import { getCluster } from '@/data/mock-news';
import { colors } from '@/theme/colors';
import { ChatMessage } from '@/types/news';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cluster = getCluster(id);
  const { ensureRoom, rooms, sendMessage } = useChats();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (id) ensureRoom(id);
  }, [ensureRoom, id]);

  const room = useMemo(() => rooms.find((item) => item.clusterId === id), [id, rooms]);
  const messages = room?.messages ?? [];

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length]);

  if (!cluster) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="AI 뉴스 대화" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>대화할 뉴스를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const submit = () => {
    if (!input.trim()) return;
    sendMessage(cluster.id, input);
    setInput('');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScreenHeader title={cluster.representativeTitle} />

        <FlatList
          contentContainerStyle={styles.messages}
          data={messages}
          keyExtractor={(item) => item.id}
          ref={listRef}
          renderItem={({ item }) => {
            const assistant = item.role === 'assistant';
            return (
              <View style={[styles.messageRow, !assistant && styles.userMessageRow]}>
                {assistant ? (
                  <View style={styles.botIcon}>
                    <MaterialCommunityIcons color="#FFFFFF" name="robot-outline" size={22} />
                  </View>
                ) : null}
                <View style={[styles.messageBlock, !assistant && styles.userMessageBlock]}>
                  {item.isBriefing ? (
                    <View style={styles.briefingLabel}>
                      <Text style={styles.briefingLabelText}>요약 브리핑</Text>
                    </View>
                  ) : null}
                  <View style={[styles.bubble, !assistant && styles.userBubble]}>
                    <Text style={[styles.messageText, !assistant && styles.userMessageText]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.messageTime, !assistant && styles.userMessageTime]}>
                      {item.createdAt}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.composer}>
          <TextInput
            multiline
            onChangeText={setInput}
            placeholder="이 뉴스에 대해 궁금한 점을 물어보세요"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={input}
          />
          <Pressable
            accessibilityLabel="메시지 보내기"
            disabled={!input.trim()}
            onPress={submit}
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          >
            <MaterialCommunityIcons color="#FFFFFF" name="send" size={21} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messages: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
  },
  messageRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  messageBlock: {
    maxWidth: '82%',
  },
  userMessageBlock: {
    alignItems: 'flex-end',
  },
  briefingLabel: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.goldSoft,
    borderRadius: 12,
    marginBottom: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  briefingLabelText: {
    color: '#75561B',
    fontSize: 11,
    fontWeight: '800',
  },
  bubble: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 18,
    borderTopLeftRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 5,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 25,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 7,
  },
  userMessageTime: {
    color: '#D8E1DC',
    textAlign: 'right',
  },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    maxHeight: 110,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  sendButtonDisabled: {
    backgroundColor: '#C9D0CC',
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
