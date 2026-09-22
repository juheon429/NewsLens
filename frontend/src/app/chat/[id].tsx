import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useCluster } from '@/hooks/use-news-api';
import { colors } from '@/theme/colors';
import { ChatMessage } from '@/types/news';

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cluster, error: clusterError, loading: clusterLoading } = useCluster(id);
  const {
    ensureRoom,
    error: chatError,
    loading: chatLoading,
    rooms,
    sendMessage,
    sendingClusterId,
  } = useChats();
  const [input, setInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const room = useMemo(() => rooms.find((item) => item.clusterId === id), [id, rooms]);
  const messages = room?.messages ?? [];
  const sending = sendingClusterId === id;

  useEffect(() => {
    if (id && !chatLoading) void ensureRoom(id).catch(() => undefined);
  }, [chatLoading, ensureRoom, id]);

  useEffect(() => {
    if (messages.length || sending) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length, sending]);

  if (clusterLoading || chatLoading || (cluster && !room && !chatError)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="AI 뉴스 대화" />
        <View style={styles.statusState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.statusText}>대화를 불러오고 있습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cluster || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="AI 뉴스 대화" />
        <View style={styles.statusState}>
          <Text style={styles.statusTitle}>대화할 뉴스를 찾을 수 없습니다</Text>
          <Text style={styles.statusText}>{clusterError ?? chatError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const submit = async () => {
    const message = input.trim();
    if (!message || sending) return;
    setInput('');
    setSubmitError(null);
    try {
      await sendMessage(cluster.id, message);
    } catch (error) {
      setInput(message);
      setSubmitError(error instanceof Error ? error.message : '답변을 받지 못했습니다.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScreenHeader title={room.title} />

        <FlatList
          contentContainerStyle={styles.messages}
          data={messages}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            sending ? (
              <View style={styles.messageRow}>
                <View style={styles.botIcon}>
                  <MaterialCommunityIcons color="#FFFFFF" name="robot-outline" size={22} />
                </View>
                <View style={[styles.bubble, styles.loadingBubble]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.loadingText}>답변을 작성하고 있습니다.</Text>
                </View>
              </View>
            ) : null
          }
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
                      {formatMessageTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        <View style={styles.composer}>
          <TextInput
            editable={!sending}
            maxLength={1000}
            multiline
            onChangeText={setInput}
            placeholder="이 뉴스에 대해 궁금한 점을 물어보세요"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={input}
          />
          <Pressable
            accessibilityLabel="메시지 보내기"
            disabled={!input.trim() || sending}
            onPress={() => void submit()}
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
          >
            <MaterialCommunityIcons color="#FFFFFF" name="send" size={21} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  keyboardView: { flex: 1 },
  messages: { flexGrow: 1, gap: 18, padding: 20 },
  messageRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  userMessageRow: { justifyContent: 'flex-end' },
  botIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  messageBlock: { maxWidth: '82%' },
  userMessageBlock: { alignItems: 'flex-end' },
  briefingLabel: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.goldSoft,
    borderRadius: 12,
    marginBottom: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  briefingLabelText: { color: '#75561B', fontSize: 11, fontWeight: '800' },
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
  messageText: { color: colors.text, fontSize: 15, lineHeight: 25 },
  userMessageText: { color: '#FFFFFF' },
  messageTime: { color: colors.textTertiary, fontSize: 11, marginTop: 7 },
  userMessageTime: { color: '#D8E1DC', textAlign: 'right' },
  loadingBubble: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  loadingText: { color: colors.textSecondary, fontSize: 13 },
  errorText: { color: '#A33A32', fontSize: 12, paddingHorizontal: 18, paddingTop: 8 },
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
  sendButtonDisabled: { backgroundColor: '#C9D0CC' },
  statusState: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  statusTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  statusText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
