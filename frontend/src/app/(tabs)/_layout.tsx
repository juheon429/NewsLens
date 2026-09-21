import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(251, 252, 250, 0.98)',
          borderTopColor: colors.border,
          height: 76,
          paddingBottom: 9,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? 'newspaper-variant' : 'newspaper-variant-outline'}
              size={25}
            />
          ),
          title: '메인',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? 'chat' : 'chat-outline'}
              size={25}
            />
          ),
          title: '채팅 기록',
        }}
      />
    </Tabs>
  );
}

