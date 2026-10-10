import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { tokens } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { MessageDto, NotificationItem } from '../lib/types';

interface RealtimeContextValue {
  connected: boolean;
  subscribeToThread: (applicationId: number, onMessage: (msg: MessageDto) => void) => () => void;
  subscribeToNotifications: (onNotification: (notif: NotificationItem) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  subscribeToThread: () => () => {},
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

  const subscribeToThread = (applicationId: number, onMessage: (msg: MessageDto) => void) => {
    const client = clientRef.current;
    if (!client || !client.connected) return () => {};

    const sub = client.subscribe(`/topic/applications/${applicationId}`, (frame) => {
      try {
        const data = JSON.parse(frame.body);
        onMessage(data);
      } catch (e) {
        console.error('Failed to parse incoming message:', e);
      }
    });

    return () => sub.unsubscribe();
  };

  const subscribeToNotifications = (onNotification: (notif: NotificationItem) => void) => {
    const client = clientRef.current;
    if (!client || !client.connected) return () => {};

    const sub = client.subscribe('/user/queue/notifications', (frame) => {
      try {
        const data = JSON.parse(frame.body);
        onNotification(data);
      } catch (e) {
        console.error('Failed to parse incoming notification:', e);
      }
    });

    return () => sub.unsubscribe();
  };

  return (
    <RealtimeContext.Provider value={{ connected, subscribeToThread, subscribeToNotifications }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
