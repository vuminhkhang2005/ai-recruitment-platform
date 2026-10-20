import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { tokens } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { MessageDto, NotificationItem, ReadReceiptDto } from '../lib/types';

interface RealtimeContextValue {
  connected: boolean;
  subscribeToThread: (
    applicationId: number,
    onMessage: (msg: MessageDto) => void,
    onReadReceipt?: (receipt: ReadReceiptDto) => void
  ) => () => void;
  subscribeToUserMessages: (
    onMessage: (msg: MessageDto) => void,
    onReadReceipt?: (receipt: ReadReceiptDto) => void
  ) => () => void;
  subscribeToNotifications: (onNotification: (notif: NotificationItem) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  subscribeToThread: () => () => {},
  subscribeToUserMessages: () => () => {},
  subscribeToNotifications: () => () => {},
});

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = tokens.access;
    if (!token || !user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    const brokerURL = `${protocol}//${loc.host}/ws`;

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [user?.id]);

  const subscribeToThread = useCallback(
    (
      applicationId: number,
      onMessage: (msg: MessageDto) => void,
      onReadReceipt?: (receipt: ReadReceiptDto) => void
    ) => {
      const client = clientRef.current;
      if (!client || !connected || !client.connected) return () => {};

      const msgSub = client.subscribe(`/topic/applications/${applicationId}`, (frame) => {
        try {
          const data = JSON.parse(frame.body);
          onMessage(data);
        } catch (e) {
          console.error('Failed to parse incoming message:', e);
        }
      });

      const readSub = onReadReceipt
        ? client.subscribe(`/topic/applications/${applicationId}/read`, (frame) => {
            try {
              const data = JSON.parse(frame.body);
              onReadReceipt(data);
            } catch (e) {
              console.error('Failed to parse read receipt:', e);
            }
          })
        : null;

      return () => {
        msgSub.unsubscribe();
        readSub?.unsubscribe();
      };
    },
    [connected]
  );

  const subscribeToUserMessages = useCallback(
    (
      onMessage: (msg: MessageDto) => void,
      onReadReceipt?: (receipt: ReadReceiptDto) => void
    ) => {
      const client = clientRef.current;
      if (!client || !connected || !client.connected) return () => {};

      const msgSub = client.subscribe('/user/queue/messages', (frame) => {
        try {
          const data = JSON.parse(frame.body);
          onMessage(data);
        } catch (e) {
          console.error('Failed to parse user queue message:', e);
        }
      });

      const readSub = onReadReceipt
        ? client.subscribe('/user/queue/messages-read', (frame) => {
            try {
              const data = JSON.parse(frame.body);
              onReadReceipt(data);
            } catch (e) {
              console.error('Failed to parse user queue read receipt:', e);
            }
          })
        : null;

      return () => {
        msgSub.unsubscribe();
        readSub?.unsubscribe();
      };
    },
    [connected]
  );

  const subscribeToNotifications = useCallback(
    (onNotification: (notif: NotificationItem) => void) => {
      const client = clientRef.current;
      if (!client || !connected || !client.connected) return () => {};

      const sub = client.subscribe('/user/queue/notifications', (frame) => {
        try {
          const data = JSON.parse(frame.body);
          onNotification(data);
        } catch (e) {
          console.error('Failed to parse incoming notification:', e);
        }
      });

      return () => sub.unsubscribe();
    },
    [connected]
  );

  return (
    <RealtimeContext.Provider
      value={{ connected, subscribeToThread, subscribeToUserMessages, subscribeToNotifications }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
