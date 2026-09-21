import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChatProvider } from '@/context/chat-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ChatProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cluster/[id]" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="article/[id]" />
        </Stack>
      </ChatProvider>
    </SafeAreaProvider>
  );
}
