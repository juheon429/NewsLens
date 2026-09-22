import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  deleteChatRoom,
  getChatRoom,
  getChatRooms,
  postChatMessage,
} from '@/api/news-api';
import { ChatRoom } from '@/types/news';

const CLIENT_ID_STORAGE_KEY = 'newslens.client-id.v1';

interface ChatContextValue {
  error: string | null;
  ensureRoom: (clusterId: string) => Promise<void>;
  leaveRoom: (clusterId: string) => Promise<void>;
  loading: boolean;
  rooms: ChatRoom[];
  sendMessage: (clusterId: string, content: string) => Promise<void>;
  sendingClusterId: string | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function createClientId() {
  const time = Date.now().toString(36);
  const random = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  return `device_${time}_${random}`.slice(0, 100);
}

function replaceRoom(rooms: ChatRoom[], room: ChatRoom) {
  return [room, ...rooms.filter((item) => item.clusterId !== room.clusterId)];
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : '채팅 서버에 연결하지 못했습니다.';
}

export function ChatProvider({ children }: PropsWithChildren) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingClusterId, setSendingClusterId] = useState<string | null>(null);
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const initialize = async () => {
      try {
        let clientId = await AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY);
        if (!clientId) {
          clientId = createClientId();
          await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
        }
        clientIdRef.current = clientId;
        const savedRooms = await getChatRooms(clientId, controller.signal);
        if (active) setRooms(savedRooms);
      } catch (initializeError) {
        if (active && !controller.signal.aborted) setError(readError(initializeError));
      } finally {
        if (active) setLoading(false);
      }
    };

    void initialize();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const ensureRoom = useCallback(async (clusterId: string) => {
    const clientId = clientIdRef.current;
    if (!clientId) return;
    try {
      setError(null);
      const room = await getChatRoom(clientId, clusterId);
      setRooms((current) => replaceRoom(current, room));
    } catch (requestError) {
      setError(readError(requestError));
      throw requestError;
    }
  }, []);

  const sendMessage = useCallback(
    async (clusterId: string, content: string) => {
      const clientId = clientIdRef.current;
      if (!clientId) throw new Error('채팅을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.');

      const normalized = content.trim();
      if (!normalized || sendingClusterId) return;
      try {
        setError(null);
        setSendingClusterId(clusterId);
        const room = await postChatMessage(clientId, clusterId, normalized);
        setRooms((current) => replaceRoom(current, room));
      } catch (requestError) {
        setError(readError(requestError));
        throw requestError;
      } finally {
        setSendingClusterId(null);
      }
    },
    [sendingClusterId],
  );

  const leaveRoom = useCallback(async (clusterId: string) => {
    const clientId = clientIdRef.current;
    if (!clientId) throw new Error('채팅을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.');
    try {
      setError(null);
      await deleteChatRoom(clientId, clusterId);
      setRooms((current) => current.filter((room) => room.clusterId !== clusterId));
    } catch (requestError) {
      setError(readError(requestError));
      throw requestError;
    }
  }, []);

  const value = useMemo(
    () => ({ error, ensureRoom, leaveRoom, loading, rooms, sendMessage, sendingClusterId }),
    [error, ensureRoom, leaveRoom, loading, rooms, sendMessage, sendingClusterId],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChats must be used inside ChatProvider');
  return context;
}
